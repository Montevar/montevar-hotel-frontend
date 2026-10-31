"use client";

import {
  Badge,
  Box,
  Button,
  Flex,
  FormControl,
  FormHelperText,
  FormLabel,
  Heading,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  Spinner,
  Tab,
  Table,
  TableContainer,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Tbody,
  Td,
  Text,
  Textarea,
  Th,
  Thead,
  Tr,
  useDisclosure,
  useToast,
  VStack,
} from "@chakra-ui/react";
import NextLink from "next/link";
import Script from "next/script";
import { useCallback, useEffect, useRef, useState } from "react";
import { getApiBaseUrl } from "@/utils/apiConfig";

type Stage = "loading" | "signed_out" | "needs_password" | "needs_password_setup" | "signed_in";

type SessionInfo = {
  stage: Stage;
  email?: string;
  name?: string;
  expiresAt?: string;
  googleClientId?: string | null;
};

type Room = {
  _id: string;
  name: string;
  category: string;
  price: number;
  roomNumber?: string;
  images?: string[];
  amenities?: string[];
};

type AuditEntry = { actor: string; action: string; details?: Record<string, unknown>; ip?: string; at: string };

type GoogleId = {
  initialize: (opts: { client_id: string; callback: (r: { credential: string }) => void }) => void;
  renderButton: (el: HTMLElement, opts: Record<string, unknown>) => void;
};
declare global {
  interface Window {
    google?: { accounts: { id: GoogleId } };
  }
}

const CATEGORIES = ["Standard", "Executive", "Classic Executive", "Super Executive", "Royal Suite"];

// All manager API calls send the session cookie and return { ok, status, data }
const api = async (path: string, method = "GET", body?: unknown) => {
  const res = await fetch(`${getApiBaseUrl()}/api${path}`, {
    method,
    credentials: "include",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  let data;
  try {
    data = await res.json();
  } catch {
    data = {};
  }
  return { ok: res.ok, status: res.status, data };
};

// Prevents double submission: ignores calls while one is running, exposes a loading flag
const useSingleFlight = () => {
  const busyRef = useRef(false);
  const [busy, setBusy] = useState(false);
  const run = useCallback(async (fn: () => Promise<void>) => {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    try {
      await fn();
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }, []);
  return { busy, run };
};

export default function ManagerPage() {
  const [session, setSession] = useState<SessionInfo>({ stage: "loading" });

  const refreshSession = useCallback(async () => {
    const { data } = await api("/manager/session");
    setSession(data.stage ? data : { stage: "signed_out" });
  }, []);

  useEffect(() => {
    refreshSession().catch(() => setSession({ stage: "signed_out" }));
  }, [refreshSession]);

  const logout = async () => {
    await api("/manager/logout", "POST");
    await refreshSession();
  };

  if (session.stage === "loading") {
    return (
      <Flex minH="100vh" align="center" justify="center">
        <Spinner />
      </Flex>
    );
  }

  if (session.stage === "signed_in") {
    return <ManagementDashboard session={session} onLogout={logout} onSessionLost={refreshSession} />;
  }

  return (
    <Flex minH="100vh" align="center" justify="center" bg="gray.50" p={4}>
      <Box p={6} maxW="420px" w="100%" borderRadius="md" boxShadow="md" bg="white">
        <Heading size="lg" mb={1} textAlign="center">
          Management
        </Heading>
        <Text mb={6} textAlign="center" color="gray.600" fontSize="sm">
          Upper management only
        </Text>

        {session.stage === "signed_out" && (
          <GoogleStep clientId={session.googleClientId} onDone={(s) => setSession(s)} />
        )}
        {session.stage === "needs_password" && (
          <PasswordStep email={session.email} onDone={(s) => setSession(s)} onSwitch={logout} />
        )}
        {session.stage === "needs_password_setup" && (
          <CreatePasswordStep email={session.email} onDone={(s) => setSession(s)} onSwitch={logout} />
        )}
      </Box>
    </Flex>
  );
}

// ---------- Step 1: Google ----------
function GoogleStep({ clientId, onDone }: { clientId?: string | null; onDone: (s: SessionInfo) => void }) {
  const buttonRef = useRef<HTMLDivElement>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (window.google) setScriptLoaded(true);
  }, []);

  useEffect(() => {
    if (!scriptLoaded || !clientId || !window.google || !buttonRef.current) return;
    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: async ({ credential }) => {
        setError("");
        setChecking(true);
        const { ok, data } = await api("/manager/google", "POST", { credential });
        setChecking(false);
        if (ok) onDone(data);
        else setError(data.message || "Google sign-in failed.");
      },
    });
    window.google.accounts.id.renderButton(buttonRef.current, { theme: "outline", size: "large", width: 300 });
  }, [scriptLoaded, clientId, onDone]);

  if (!clientId) {
    return <Text color="red.500">Manager sign-in is not set up yet (missing Google client ID on the server).</Text>;
  }

  return (
    <VStack spacing={4}>
      <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" onLoad={() => setScriptLoaded(true)} />
      <Text fontSize="sm">Step 1 of 2: sign in with your Google account.</Text>
      <Box ref={buttonRef} minH="44px" />
      {checking && <Spinner size="sm" />}
      {error && <Text color="red.500" fontSize="sm">{error}</Text>}
    </VStack>
  );
}

// ---------- Step 2: password ----------
function PasswordStep({ email, onDone, onSwitch }: { email?: string; onDone: (s: SessionInfo) => void; onSwitch: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { busy, run } = useSingleFlight();

  const submit = () =>
    run(async () => {
      setError("");
      const { ok, data } = await api("/manager/password", "POST", { password });
      setPassword("");
      if (ok) onDone(data);
      else setError(data.message || "Sign-in failed.");
    });

  return (
    <VStack spacing={4} align="stretch" as="form" onSubmit={(e) => { e.preventDefault(); submit(); }}>
      <Text fontSize="sm">
        Step 2 of 2: Google account <strong>{email}</strong> confirmed. Enter your manager password.
      </Text>
      <FormControl>
        <FormLabel>Manager password</FormLabel>
        <Input type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} autoFocus />
      </FormControl>
      {error && <Text color="red.500" fontSize="sm">{error}</Text>}
      <Button type="submit" colorScheme="teal" isLoading={busy} isDisabled={!password || busy} loadingText="Checking...">
        Sign in
      </Button>
      <Button variant="link" size="sm" onClick={onSwitch}>
        Use a different Google account
      </Button>
    </VStack>
  );
}

// ---------- Step 2 (first time): create password ----------
function CreatePasswordStep({ email, onDone, onSwitch }: { email?: string; onDone: (s: SessionInfo) => void; onSwitch: () => void }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const { busy, run } = useSingleFlight();

  const submit = () =>
    run(async () => {
      setError("");
      if (password !== confirm) {
        setError("Passwords do not match.");
        return;
      }
      const { ok, data } = await api("/manager/set-password", "POST", { password });
      if (ok) onDone(data);
      else setError(data.message || "Could not set password.");
    });

  return (
    <VStack spacing={4} align="stretch" as="form" onSubmit={(e) => { e.preventDefault(); submit(); }}>
      <Text fontSize="sm">
        Welcome, <strong>{email}</strong>. This is your first sign-in: create a manager password. You will need it, as well as
        Google, every time.
      </Text>
      <FormControl>
        <FormLabel>New password</FormLabel>
        <Input type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} autoFocus />
        <FormHelperText>At least 12 characters, using 3 of: lowercase, uppercase, numbers, symbols.</FormHelperText>
      </FormControl>
      <FormControl>
        <FormLabel>Confirm password</FormLabel>
        <Input type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
      </FormControl>
      {error && <Text color="red.500" fontSize="sm">{error}</Text>}
      <Button type="submit" colorScheme="teal" isLoading={busy} isDisabled={!password || !confirm || busy} loadingText="Saving...">
        Create password and sign in
      </Button>
      <Button variant="link" size="sm" onClick={onSwitch}>
        Use a different Google account
      </Button>
    </VStack>
  );
}

// ---------- Signed in ----------
function ManagementDashboard({
  session,
  onLogout,
  onSessionLost,
}: {
  session: SessionInfo;
  onLogout: () => void;
  onSessionLost: () => void;
}) {
  const passwordModal = useDisclosure();

  return (
    <Box minH="100vh" bg="gray.100">
      <Flex bg="white" p={4} borderBottom="1px solid" borderColor="gray.300" justify="space-between" align="center" wrap="wrap" gap={3}>
        <Box>
          <Heading size="md">Upper Management</Heading>
          <Text fontSize="sm" color="gray.600">
            {session.name ? `${session.name} · ` : ""}
            {session.email}
            {session.expiresAt && ` · signed in until ${new Date(session.expiresAt).toLocaleTimeString()}`}
          </Text>
        </Box>
        <Flex gap={2} wrap="wrap">
          <Button as={NextLink} href="/dashboard" variant="outline">
            Bookings dashboard
          </Button>
          <Button variant="outline" onClick={passwordModal.onOpen}>
            Change password
          </Button>
          <Button colorScheme="red" onClick={onLogout}>
            Logout
          </Button>
        </Flex>
      </Flex>

      <Box p={{ base: 3, md: 6 }}>
        <Tabs colorScheme="teal" isLazy>
          <TabList>
            <Tab>Rooms</Tab>
            <Tab>Activity log</Tab>
          </TabList>
          <TabPanels>
            <TabPanel px={0}>
              <RoomsManager onSessionLost={onSessionLost} />
            </TabPanel>
            <TabPanel px={0}>
              <ActivityLog onSessionLost={onSessionLost} />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>

      <ChangePasswordModal isOpen={passwordModal.isOpen} onClose={passwordModal.onClose} onSessionLost={onSessionLost} />
    </Box>
  );
}

const emptyForm = { name: "", category: "Standard", price: "", roomNumber: "", amenities: "", images: "" };
type RoomForm = typeof emptyForm;

function RoomsManager({ onSessionLost }: { onSessionLost: () => void }) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Room | null>(null); // null + open modal = adding a new room
  const [form, setForm] = useState<RoomForm>(emptyForm);
  const [deleting, setDeleting] = useState<Room | null>(null);
  const [confirmName, setConfirmName] = useState("");
  const editModal = useDisclosure();
  const deleteModal = useDisclosure();
  const toast = useToast();
  const save = useSingleFlight();
  const remove = useSingleFlight();

  const loadRooms = useCallback(async () => {
    const { data } = await api("/rooms");
    setRooms(Array.isArray(data) ? data.sort((a: Room, b: Room) => a.name.localeCompare(b.name)) : []);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadRooms();
  }, [loadRooms]);

  const handleError = (status: number, message?: string) => {
    if (status === 401) {
      toast({ title: "Your manager session ended. Please sign in again.", status: "warning" });
      onSessionLost();
      return;
    }
    toast({ title: message || "Something went wrong.", status: "error", isClosable: true });
  };

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    editModal.onOpen();
  };

  const openEdit = (room: Room) => {
    setEditing(room);
    setForm({
      name: room.name,
      category: room.category,
      price: String(room.price),
      roomNumber: room.roomNumber || "",
      amenities: (room.amenities || []).join(", "),
      images: (room.images || []).join("\n"),
    });
    editModal.onOpen();
  };

  const submitRoom = () =>
    save.run(async () => {
      const body = {
        name: form.name,
        category: form.category,
        price: Number(form.price),
        roomNumber: form.roomNumber,
        amenities: form.amenities.split(",").map((a) => a.trim()).filter(Boolean),
        images: form.images.split("\n").map((i) => i.trim()).filter(Boolean),
      };
      const { ok, status, data } = editing
        ? await api(`/rooms/${editing._id}`, "PUT", body)
        : await api("/rooms", "POST", body);
      if (!ok) return handleError(status, data.message);

      toast({ title: editing ? `Saved ${data.name}` : `Added ${data.name}`, status: "success" });
      editModal.onClose();
      await loadRooms();
    });

  const openDelete = (room: Room) => {
    setDeleting(room);
    setConfirmName("");
    deleteModal.onOpen();
  };

  const submitDelete = () =>
    remove.run(async () => {
      if (!deleting) return;
      const { ok, status, data } = await api(`/rooms/${deleting._id}`, "DELETE", { confirmName });
      if (!ok) return handleError(status, data.message);

      toast({ title: `Deleted ${deleting.name}`, status: "success" });
      deleteModal.onClose();
      await loadRooms();
    });

  if (loading) return <Spinner />;

  return (
    <Box bg="white" borderRadius="md" boxShadow="sm" p={4}>
      <Flex justify="space-between" align="center" mb={4} gap={3} wrap="wrap">
        <Text color="gray.600">{rooms.length} rooms</Text>
        <Button colorScheme="teal" onClick={openAdd}>
          Add room
        </Button>
      </Flex>
      <TableContainer>
        <Table size="sm">
          <Thead>
            <Tr>
              <Th>Room</Th>
              <Th>No.</Th>
              <Th>Category</Th>
              <Th isNumeric>Price / night</Th>
              <Th />
            </Tr>
          </Thead>
          <Tbody>
            {rooms.map((room) => (
              <Tr key={room._id}>
                <Td fontWeight="semibold">{room.name}</Td>
                <Td>{room.roomNumber || "—"}</Td>
                <Td>{room.category}</Td>
                <Td isNumeric>₦{room.price.toLocaleString()}</Td>
                <Td>
                  <Flex gap={2} justify="flex-end">
                    <Button size="sm" onClick={() => openEdit(room)}>
                      Edit
                    </Button>
                    <Button size="sm" colorScheme="red" variant="outline" onClick={() => openDelete(room)}>
                      Delete
                    </Button>
                  </Flex>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>

      {/* Add / edit room */}
      <Modal isOpen={editModal.isOpen} onClose={editModal.onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{editing ? `Edit ${editing.name}` : "Add room"}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={3}>
              <FormControl isRequired>
                <FormLabel>Room name</FormLabel>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                {editing && form.name !== editing.name && (
                  <FormHelperText>Existing bookings for this room will be renamed too.</FormHelperText>
                )}
              </FormControl>
              <Flex gap={3} w="100%">
                <FormControl isRequired>
                  <FormLabel>Category</FormLabel>
                  <Select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </Select>
                </FormControl>
                <FormControl maxW="120px">
                  <FormLabel>Room no.</FormLabel>
                  <Input value={form.roomNumber} onChange={(e) => setForm({ ...form, roomNumber: e.target.value })} />
                </FormControl>
              </Flex>
              <FormControl isRequired>
                <FormLabel>Price per night (₦)</FormLabel>
                <Input type="number" min={1000} step={500} value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
                <FormHelperText>New prices apply to new bookings only.</FormHelperText>
              </FormControl>
              <FormControl>
                <FormLabel>Amenities</FormLabel>
                <Input value={form.amenities} onChange={(e) => setForm({ ...form, amenities: e.target.value })} />
                <FormHelperText>Separate with commas.</FormHelperText>
              </FormControl>
              <FormControl>
                <FormLabel>Photos</FormLabel>
                <Textarea rows={3} value={form.images} onChange={(e) => setForm({ ...form, images: e.target.value })} />
                <FormHelperText>One per line, e.g. /images/cyprus.jpg or an https:// link.</FormHelperText>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="teal" mr={3} onClick={submitRoom} isLoading={save.busy} isDisabled={save.busy} loadingText="Saving...">
              {editing ? "Save changes" : "Add room"}
            </Button>
            <Button onClick={editModal.onClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete room */}
      <Modal isOpen={deleteModal.isOpen} onClose={deleteModal.onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Delete {deleting?.name}?</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text mb={3}>
              This removes the room from the website. It can&apos;t be undone. Rooms with upcoming bookings can&apos;t be deleted.
            </Text>
            <FormControl>
              <FormLabel>
                Type <strong>{deleting?.name}</strong> to confirm
              </FormLabel>
              <Input value={confirmName} onChange={(e) => setConfirmName(e.target.value)} />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button
              colorScheme="red"
              mr={3}
              onClick={submitDelete}
              isLoading={remove.busy}
              isDisabled={remove.busy || confirmName !== deleting?.name}
              loadingText="Deleting..."
            >
              Delete room
            </Button>
            <Button onClick={deleteModal.onClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}

const ACTION_LABELS: Record<string, string> = {
  "login.success": "Signed in",
  "login.google_ok": "Google step passed",
  "login.google_invalid": "Invalid Google sign-in",
  "login.google_not_allowed": "Google account not allowed",
  "login.password_failed": "Wrong password",
  "login.locked": "Locked out (too many wrong passwords)",
  "password.created": "Created password",
  "password.changed": "Changed password",
  "password.change_failed": "Failed password change",
  logout: "Signed out",
  "room.create": "Added room",
  "room.update": "Edited room",
  "room.delete": "Deleted room",
};

// "price: 30,000 → 32,000" lines from a room.update entry
const describeChanges = (details?: Record<string, unknown>) => {
  const before = (details?.before || {}) as Record<string, unknown>;
  const after = (details?.after || {}) as Record<string, unknown>;
  const show = (v: unknown) =>
    Array.isArray(v) ? v.join(", ") || "(none)" : typeof v === "number" ? v.toLocaleString() : String(v ?? "(none)");
  return Object.keys(after).map((k) => `${k}: ${show(before[k])} → ${show(after[k])}`);
};

function ActivityLog({ onSessionLost }: { onSessionLost: () => void }) {
  const [entries, setEntries] = useState<AuditEntry[] | null>(null);

  useEffect(() => {
    api("/manager/audit").then(({ ok, status, data }) => {
      if (status === 401) return onSessionLost();
      setEntries(ok ? data : []);
    });
  }, [onSessionLost]);

  if (!entries) return <Spinner />;

  const isWarning = (a: string) => /failed|invalid|not_allowed|locked/.test(a);

  return (
    <Box bg="white" borderRadius="md" boxShadow="sm" p={4}>
      <TableContainer>
        <Table size="sm">
          <Thead>
            <Tr>
              <Th>When</Th>
              <Th>Who</Th>
              <Th>What</Th>
              <Th>Details</Th>
            </Tr>
          </Thead>
          <Tbody>
            {entries.map((e, i) => (
              <Tr key={i}>
                <Td whiteSpace="nowrap">{new Date(e.at).toLocaleString()}</Td>
                <Td>{e.actor}</Td>
                <Td>
                  <Badge colorScheme={isWarning(e.action) ? "red" : e.action.startsWith("room.") ? "purple" : "green"}>
                    {ACTION_LABELS[e.action] || e.action}
                  </Badge>
                </Td>
                <Td fontSize="xs" whiteSpace="normal">
                  <Text fontWeight="semibold">{e.details && "name" in e.details ? String(e.details.name) : ""}</Text>
                  {describeChanges(e.details).map((line) => (
                    <Text key={line}>{line}</Text>
                  ))}
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
      {entries.length === 0 && <Text color="gray.600">No activity yet.</Text>}
    </Box>
  );
}

function ChangePasswordModal({ isOpen, onClose, onSessionLost }: { isOpen: boolean; onClose: () => void; onSessionLost: () => void }) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const toast = useToast();
  const { busy, run } = useSingleFlight();

  const close = () => {
    setCurrent("");
    setNext("");
    setConfirm("");
    setError("");
    onClose();
  };

  const submit = () =>
    run(async () => {
      setError("");
      if (next !== confirm) {
        setError("New passwords do not match.");
        return;
      }
      const { ok, status, data } = await api("/manager/change-password", "POST", { currentPassword: current, newPassword: next });
      if (status === 401 && !data.message?.includes("Current password")) {
        close();
        return onSessionLost();
      }
      if (!ok) {
        setError(data.message || "Could not change password.");
        return;
      }
      toast({ title: "Password changed.", status: "success" });
      close();
    });

  return (
    <Modal isOpen={isOpen} onClose={close}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Change manager password</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={3}>
            <FormControl>
              <FormLabel>Current password</FormLabel>
              <Input type="password" autoComplete="current-password" value={current} onChange={(e) => setCurrent(e.target.value)} />
            </FormControl>
            <FormControl>
              <FormLabel>New password</FormLabel>
              <Input type="password" autoComplete="new-password" value={next} onChange={(e) => setNext(e.target.value)} />
              <FormHelperText>At least 12 characters, using 3 of: lowercase, uppercase, numbers, symbols.</FormHelperText>
            </FormControl>
            <FormControl>
              <FormLabel>Confirm new password</FormLabel>
              <Input type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
            </FormControl>
            {error && <Text color="red.500" fontSize="sm">{error}</Text>}
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="teal" mr={3} onClick={submit} isLoading={busy} isDisabled={busy || !current || !next || !confirm} loadingText="Saving...">
            Change password
          </Button>
          <Button onClick={close}>Cancel</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
