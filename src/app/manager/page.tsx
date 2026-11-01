"use client";

import {
  Alert,
  AlertIcon,
  Badge,
  Box,
  Button,
  Checkbox,
  Flex,
  FormControl,
  FormHelperText,
  FormLabel,
  Heading,
  Image,
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
import Script from "next/script";
import { useCallback, useEffect, useRef, useState } from "react";
import { getApiBaseUrl } from "@/utils/apiConfig";
import type { Booking as BaseBooking } from "@/types";

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

type Booking = BaseBooking & { reference?: string; bookedAt?: string };

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
          <Button as="a" href="/dashboard" target="_blank" rel="noopener noreferrer" variant="outline">
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
          {/* On phones the tabs scroll sideways instead of widening the page */}
          <TabList overflowX="auto" overflowY="hidden" sx={{ "& > button": { flexShrink: 0, whiteSpace: "nowrap" } }}>
            <Tab>Bookings</Tab>
            <Tab>Discounts</Tab>
            <Tab>Booking history</Tab>
            <Tab>Rooms</Tab>
            <Tab>Staff login</Tab>
            <Tab>Activity log</Tab>
          </TabList>
          <TabPanels>
            <TabPanel px={0}>
              <BookingsManager onSessionLost={onSessionLost} />
            </TabPanel>
            <TabPanel px={0}>
              <DiscountApprovals onSessionLost={onSessionLost} />
            </TabPanel>
            <TabPanel px={0}>
              <BookingHistory onSessionLost={onSessionLost} />
            </TabPanel>
            <TabPanel px={0}>
              <RoomsManager onSessionLost={onSessionLost} />
            </TabPanel>
            <TabPanel px={0}>
              <StaffLoginSetup onSessionLost={onSessionLost} />
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
    // Newest room first (a MongoDB id starts with its creation time, so a later id sorts higher)
    setRooms(Array.isArray(data) ? data.sort((a: Room, b: Room) => b._id.localeCompare(a._id)) : []);
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
  "staff_login.success": "Staff signed in",
  "staff_login.locked": "Staff login paused (too many wrong codes)",
  "staff_authenticator.replace": "New staff authenticator",
  "room.create": "Added room",
  "room.update": "Edited room",
  "room.delete": "Deleted room",
  "booking.create": "Front desk booking",
  "booking.cancel": "Cancelled booking",
  "booking.mark_paid": "Marked as paid",
  "booking.clear_all": "Cleared ALL bookings",
  "booking.update": "Edited booking",
  "booking.delete": "Deleted booking",
  "booking.expire": "Cancelled · not paid in time",
  "booking.discount_request": "Discount requested",
  "booking.discount_approve": "Discount approved",
  "booking.discount_reject": "Discount rejected",
};

const FIELD_LABELS: Record<string, string> = {
  guest: "Guest",
  phone: "Phone",
  email: "Email",
  room: "Room",
  checkIn: "Check-in",
  checkOut: "Check-out",
  nights: "Nights",
  total: "Total (₦)",
  paid: "Paid",
  cancelled: "Cancelled",
  needsAttention: "Needs attention",
  source: "Booked by",
  reference: "Paystack ref",
  bookedAt: "Booked on",
};

const showValue = (v: unknown) =>
  Array.isArray(v)
    ? v.join(", ") || "(none)"
    : typeof v === "boolean"
      ? v ? "Yes" : "No"
      : typeof v === "number"
        ? v.toLocaleString()
        : String(v ?? "(none)");

// "Room: Malaysia → Croatia" lines from an update entry
const describeChanges = (details?: Record<string, unknown>) => {
  const before = (details?.before || {}) as Record<string, unknown>;
  const after = (details?.after || {}) as Record<string, unknown>;
  return Object.keys(after).map((k) => `${FIELD_LABELS[k] || k}: ${showValue(before[k])} → ${showValue(after[k])}`);
};

// "Room: Croatia" lines describing a whole booking (kept when it is deleted or created)
const describeBooking = (details?: Record<string, unknown>) => {
  const booking = (details?.booking || {}) as Record<string, unknown>;
  return Object.keys(FIELD_LABELS)
    .filter((k) => booking[k] !== null && booking[k] !== undefined)
    .map((k) => `${FIELD_LABELS[k]}: ${showValue(booking[k])}`);
};

const actionColor = (a: string) =>
  /failed|invalid|not_allowed|locked|delete|clear_all/.test(a)
    ? "red"
    : a.startsWith("room.")
      ? "purple"
      : a.startsWith("booking.")
        ? "blue"
        : "green";

// ---------- Bookings (receptionist + online) ----------
const lagosDay = (d: string) => new Date(d).toLocaleDateString("en-CA", { timeZone: "Africa/Lagos" });
const showDay = (d: string) =>
  new Date(d).toLocaleDateString("en-GB", { timeZone: "Africa/Lagos", day: "numeric", month: "short", year: "numeric" });
const showDateTime = (d: string) =>
  new Date(d).toLocaleString("en-GB", { timeZone: "Africa/Lagos", dateStyle: "medium", timeStyle: "short" });
const nightsBetween = (start: string, end: string) =>
  Math.round((Date.parse(end) - Date.parse(start)) / (24 * 60 * 60 * 1000));

type BookingFilter = "current" | "past" | "cancelled" | "all";

const emptyBookingForm = {
  fullName: "",
  phone: "",
  email: "",
  roomName: "",
  startDate: "",
  endDate: "",
  isPaid: false,
  isCancelled: false,
  resolveAttention: false,
  reason: "",
};
type BookingForm = typeof emptyBookingForm;

function BookingsManager({ onSessionLost }: { onSessionLost: () => void }) {
  const [bookings, setBookings] = useState<Booking[] | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [filter, setFilter] = useState<BookingFilter>("current");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"checkIn" | "bookedNew" | "bookedOld">("bookedNew");
  const [editing, setEditing] = useState<Booking | null>(null);
  const [form, setForm] = useState<BookingForm>(emptyBookingForm);
  const [deleting, setDeleting] = useState<Booking | null>(null);
  const [deleteReason, setDeleteReason] = useState("");
  const editModal = useDisclosure();
  const deleteModal = useDisclosure();
  const toast = useToast();
  const save = useSingleFlight();
  const remove = useSingleFlight();

  const load = useCallback(async () => {
    const [b, r] = await Promise.all([api("/bookings"), api("/rooms")]);
    if (b.status === 401) return onSessionLost();
    setBookings(Array.isArray(b.data) ? b.data : []);
    setRooms(Array.isArray(r.data) ? r.data.sort((x: Room, y: Room) => x.name.localeCompare(y.name)) : []);
  }, [onSessionLost]);

  useEffect(() => {
    load();
  }, [load]);

  const handleError = (status: number, message?: string) => {
    if (status === 401) {
      toast({ title: "Your manager session ended. Please sign in again.", status: "warning" });
      onSessionLost();
      return;
    }
    toast({ title: message || "Something went wrong.", status: "error", isClosable: true });
  };

  const openEdit = (b: Booking) => {
    setEditing(b);
    setForm({
      fullName: b.fullName || "",
      phone: b.phone || "",
      email: b.email || "",
      roomName: b.roomName,
      startDate: lagosDay(b.startDate),
      endDate: lagosDay(b.endDate),
      isPaid: !!b.isPaid,
      isCancelled: !!b.isCancelled,
      resolveAttention: false,
      reason: "",
    });
    editModal.onOpen();
  };

  const submitEdit = () =>
    save.run(async () => {
      if (!editing) return;
      const { ok, status, data } = await api(`/bookings/${editing._id}`, "PUT", {
        fullName: form.fullName,
        phone: form.phone,
        email: form.email,
        roomName: form.roomName,
        startDate: form.startDate,
        endDate: form.endDate,
        isPaid: form.isPaid,
        isCancelled: form.isCancelled,
        resolveAttention: form.resolveAttention || undefined,
        reason: form.reason,
      });
      if (!ok) return handleError(status, data.message);

      toast({ title: `Saved booking for ${data.fullName}`, status: "success" });
      editModal.onClose();
      await load();
    });

  const openDelete = (b: Booking) => {
    setDeleting(b);
    setDeleteReason("");
    deleteModal.onOpen();
  };

  const submitDelete = () =>
    remove.run(async () => {
      if (!deleting) return;
      const { ok, status, data } = await api(`/bookings/${deleting._id}`, "DELETE", { reason: deleteReason });
      if (!ok) return handleError(status, data.message);

      toast({ title: `Deleted booking for ${deleting.fullName}`, status: "success" });
      deleteModal.onClose();
      await load();
    });

  if (!bookings) return <Spinner />;

  const now = Date.now();
  const q = search.trim().toLowerCase();
  const shown = bookings.filter((b) => {
    const ended = Date.parse(b.endDate) < now;
    if (filter === "current" && (b.isCancelled || ended)) return false;
    if (filter === "past" && (b.isCancelled || !ended)) return false;
    if (filter === "cancelled" && !b.isCancelled) return false;
    if (sourceFilter === "dashboard" && b.source !== "dashboard") return false;
    if (sourceFilter === "online" && b.source === "dashboard") return false;
    if (!q) return true;
    return [b.fullName, b.phone, b.email, b.roomName, b.reference].some((v) => v && v.toLowerCase().includes(q));
  });
  const bookedTime = (b: Booking) => (b.bookedAt ? Date.parse(b.bookedAt) : 0);
  if (sortBy === "checkIn") shown.sort((a, b) => Date.parse(a.startDate) - Date.parse(b.startDate));
  if (sortBy === "bookedNew") shown.sort((a, b) => bookedTime(b) - bookedTime(a));
  if (sortBy === "bookedOld") shown.sort((a, b) => bookedTime(a) - bookedTime(b));

  // What the booking will cost after the edit (same rule as the server: room price × nights)
  const room = rooms.find((r) => r.name === form.roomName);
  const newNights = form.startDate && form.endDate ? nightsBetween(form.startDate, form.endDate) : 0;
  const stayChanged =
    !!editing &&
    (form.roomName !== editing.roomName || form.startDate !== lagosDay(editing.startDate) || form.endDate !== lagosDay(editing.endDate));
  const newPrice = form.roomName === editing?.roomName ? editing?.roomPrice : room?.price;

  return (
    <Box bg="white" borderRadius="md" boxShadow="sm" p={4}>
      <Flex mb={4} gap={3} wrap="wrap" align="center">
        <Select maxW="200px" value={filter} onChange={(e) => setFilter(e.target.value as BookingFilter)}>
          <option value="current">Upcoming &amp; in-house</option>
          <option value="past">Past stays</option>
          <option value="cancelled">Cancelled</option>
          <option value="all">All bookings</option>
        </Select>
        <Select maxW="200px" value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value)}>
          <option value="all">Receptionist &amp; online</option>
          <option value="dashboard">Receptionist only</option>
          <option value="online">Online only</option>
        </Select>
        <Select maxW="220px" value={sortBy} onChange={(e) => setSortBy(e.target.value as typeof sortBy)}>
          <option value="bookedNew">Newest bookings first</option>
          <option value="checkIn">Sort by check-in date</option>
          <option value="bookedOld">Oldest bookings first</option>
        </Select>
        <Input maxW="260px" placeholder="Search guest, phone, room..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <Text color="gray.600" fontSize="sm">
          {shown.length} of {bookings.length} bookings
        </Text>
      </Flex>

      <TableContainer>
        <Table size="sm">
          <Thead>
            <Tr>
              <Th>Guest</Th>
              <Th>Room</Th>
              <Th>Stay</Th>
              <Th>Booked on</Th>
              <Th isNumeric>Total</Th>
              <Th>Booked by</Th>
              <Th>Status</Th>
              <Th />
            </Tr>
          </Thead>
          <Tbody>
            {shown.map((b) => (
              <Tr key={b._id}>
                <Td>
                  <Text fontWeight="semibold">{b.fullName}</Text>
                  <Text fontSize="xs" color="gray.600">
                    {b.phone} · {b.email}
                  </Text>
                </Td>
                <Td>{b.roomName}</Td>
                <Td whiteSpace="nowrap">
                  {showDay(b.startDate)} → {showDay(b.endDate)}
                  {b.nights ? (
                    <Text fontSize="xs" color="gray.600">
                      {b.nights} night{b.nights === 1 ? "" : "s"}
                    </Text>
                  ) : null}
                </Td>
                <Td whiteSpace="nowrap" fontSize="sm">
                  {b.bookedAt ? showDateTime(b.bookedAt) : "—"}
                </Td>
                <Td isNumeric>{b.totalAmount ? `₦${b.totalAmount.toLocaleString()}` : "—"}</Td>
                <Td>
                  <Badge colorScheme={b.source === "dashboard" ? "purple" : "cyan"}>
                    {b.source === "dashboard" ? "Receptionist" : "Online"}
                  </Badge>
                </Td>
                <Td>
                  <Flex gap={1} wrap="wrap">
                    {b.isCancelled ? (
                      <Badge colorScheme="gray">{b.cancelReason === "unpaid" ? "Cancelled · not paid in time" : "Cancelled"}</Badge>
                    ) : b.isPaid ? (
                      <Badge colorScheme="green">Paid</Badge>
                    ) : b.holdExpiresAt ? (
                      <Badge colorScheme="yellow">Paying on Paystack</Badge>
                    ) : (
                      <Badge colorScheme="orange">Unpaid</Badge>
                    )}
                    {!b.isCancelled && !b.isPaid && b.payBy && (
                      <Text fontSize="xs" color={Date.parse(b.payBy) <= Date.now() ? "red.600" : "gray.600"} w="100%">
                        Pay by {showDateTime(b.payBy)}
                      </Text>
                    )}
                    {b.needsAttention && (
                      <Badge colorScheme="red" title={b.needsAttention}>
                        Needs attention
                      </Badge>
                    )}
                    {b.discountStatus === "pending" && <Badge colorScheme="orange">Discount to approve</Badge>}
                    {b.discountStatus === "approved" && (
                      <Badge colorScheme="green" variant="outline">
                        ₦{b.discountAmount?.toLocaleString()} discount
                      </Badge>
                    )}
                  </Flex>
                </Td>
                <Td>
                  <Flex gap={2} justify="flex-end">
                    <Button size="sm" onClick={() => openEdit(b)}>
                      Edit
                    </Button>
                    <Button size="sm" colorScheme="red" variant="outline" onClick={() => openDelete(b)}>
                      Delete
                    </Button>
                  </Flex>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
      {shown.length === 0 && <Text color="gray.600" mt={3}>No bookings match.</Text>}

      {/* Edit booking */}
      <Modal isOpen={editModal.isOpen} onClose={editModal.onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit booking</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={3}>
              {editing?.needsAttention && (
                <Alert status="warning" borderRadius="md" fontSize="sm">
                  <AlertIcon />
                  {editing.needsAttention}
                </Alert>
              )}
              <FormControl isRequired>
                <FormLabel>Guest name</FormLabel>
                <Input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
              </FormControl>
              <Flex gap={3} w="100%" direction={{ base: "column", sm: "row" }}>
                <FormControl isRequired>
                  <FormLabel>Phone</FormLabel>
                  <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Email</FormLabel>
                  <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </FormControl>
              </Flex>
              <FormControl isRequired>
                <FormLabel>Room</FormLabel>
                <Select value={form.roomName} onChange={(e) => setForm({ ...form, roomName: e.target.value })}>
                  {!rooms.some((r) => r.name === form.roomName) && <option value={form.roomName}>{form.roomName}</option>}
                  {rooms.map((r) => (
                    <option key={r._id} value={r.name}>
                      {r.name} · {r.category} · ₦{r.price.toLocaleString()}
                    </option>
                  ))}
                </Select>
              </FormControl>
              <Flex gap={3} w="100%" direction={{ base: "column", sm: "row" }}>
                <FormControl isRequired>
                  <FormLabel>Check-in</FormLabel>
                  <Input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Check-out</FormLabel>
                  <Input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
                </FormControl>
              </Flex>
              {stayChanged && newNights > 0 && newPrice ? (
                <Text fontSize="sm" color="gray.700" alignSelf="flex-start">
                  New total: {newNights} night{newNights === 1 ? "" : "s"} × ₦{newPrice.toLocaleString()} ={" "}
                  <strong>₦{(newNights * newPrice).toLocaleString()}</strong>
                  {editing?.totalAmount ? ` (was ₦${editing.totalAmount.toLocaleString()})` : ""}
                </Text>
              ) : null}
              <Flex gap={6} w="100%" wrap="wrap">
                <Checkbox isChecked={form.isPaid} onChange={(e) => setForm({ ...form, isPaid: e.target.checked })}>
                  Paid
                </Checkbox>
                <Checkbox isChecked={form.isCancelled} onChange={(e) => setForm({ ...form, isCancelled: e.target.checked })}>
                  Cancelled
                </Checkbox>
                {editing?.needsAttention && (
                  <Checkbox
                    isChecked={form.resolveAttention}
                    onChange={(e) => setForm({ ...form, resolveAttention: e.target.checked })}
                  >
                    Problem sorted out
                  </Checkbox>
                )}
              </Flex>
              <FormControl isRequired>
                <FormLabel>Reason for this change</FormLabel>
                <Textarea
                  rows={2}
                  maxLength={300}
                  placeholder="e.g. Guest extended by one night and paid cash"
                  value={form.reason}
                  onChange={(e) => setForm({ ...form, reason: e.target.value })}
                />
                <FormHelperText>Saved in the booking history with your name.</FormHelperText>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button
              colorScheme="teal"
              mr={3}
              onClick={submitEdit}
              isLoading={save.busy}
              isDisabled={save.busy || form.reason.trim().length < 3}
              loadingText="Saving..."
            >
              Save changes
            </Button>
            <Button onClick={editModal.onClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete booking */}
      <Modal isOpen={deleteModal.isOpen} onClose={deleteModal.onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Delete this booking?</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {deleting && (
              <Box mb={3} fontSize="sm">
                <Text fontWeight="semibold">
                  {deleting.fullName} · {deleting.roomName}
                </Text>
                <Text>
                  {showDay(deleting.startDate)} → {showDay(deleting.endDate)}
                  {deleting.totalAmount ? ` · ₦${deleting.totalAmount.toLocaleString()}` : ""}
                </Text>
                {deleting.bookedAt && <Text color="gray.600">Booked on {showDateTime(deleting.bookedAt)}</Text>}
              </Box>
            )}
            {deleting?.isPaid && deleting.paymentMethod === "paystack" && (
              <Alert status="warning" borderRadius="md" fontSize="sm" mb={3}>
                <AlertIcon />
                This guest paid online. Deleting does not refund them: do that in Paystack.
              </Alert>
            )}
            <Text fontSize="sm" mb={3}>
              The booking is removed and the room becomes free for those dates. A full copy is kept in the booking history. To
              keep the record instead, use Edit and tick Cancelled.
            </Text>
            <FormControl isRequired>
              <FormLabel>Reason for deleting</FormLabel>
              <Textarea rows={2} maxLength={300} value={deleteReason} onChange={(e) => setDeleteReason(e.target.value)} />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button
              colorScheme="red"
              mr={3}
              onClick={submitDelete}
              isLoading={remove.busy}
              isDisabled={remove.busy || deleteReason.trim().length < 3}
              loadingText="Deleting..."
            >
              Delete booking
            </Button>
            <Button onClick={deleteModal.onClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}

// ---------- Booking history (audit trail of every booking change) ----------
// ---------- Discounts the receptionist gave, waiting for a manager ----------
const fullPriceOf = (b: Booking) => (b.roomPrice || 0) * (b.nights || 0);

function DiscountApprovals({ onSessionLost }: { onSessionLost: () => void }) {
  const [bookings, setBookings] = useState<Booking[] | null>(null);
  const [rejecting, setRejecting] = useState<Booking | null>(null);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const toast = useToast();
  const { busy, run } = useSingleFlight();

  const load = useCallback(async () => {
    const { ok, status, data } = await api("/bookings");
    if (status === 401) return onSessionLost();
    setBookings(ok && Array.isArray(data) ? data.filter((b: Booking) => !!b.discountStatus) : []);
  }, [onSessionLost]);

  useEffect(() => {
    load();
  }, [load]);

  const decide = (b: Booking, decision: "approve" | "reject", reasonNote = "") =>
    run(async () => {
      setError("");
      const { ok, status, data } = await api(`/bookings/${b._id}/discount`, "PATCH", { decision, note: reasonNote });
      if (status === 401) return onSessionLost();
      if (!ok) {
        if (decision === "reject") setError(data.message || "Could not reject the discount.");
        else toast({ title: data.message || "Could not approve the discount.", status: "error" });
        return;
      }
      toast({
        title: decision === "approve" ? "Discount approved" : "Discount rejected",
        description:
          decision === "approve"
            ? `${b.fullName} pays ₦${data.totalAmount?.toLocaleString()}.`
            : `${b.fullName} pays the full ₦${data.totalAmount?.toLocaleString()}.`,
        status: "success",
      });
      setRejecting(null);
      setNote("");
      load();
    });

  if (!bookings) return <Spinner />;

  const pending = bookings
    .filter((b) => b.discountStatus === "pending")
    .sort((a, b) => Date.parse(b.discountRequestedAt || "") - Date.parse(a.discountRequestedAt || ""));
  const decided = bookings
    .filter((b) => b.discountStatus !== "pending")
    .sort((a, b) => Date.parse(b.discountDecidedAt || "") - Date.parse(a.discountDecidedAt || ""));

  const priceLines = (b: Booking) => (
    <>
      <Text>Full price: ₦{fullPriceOf(b).toLocaleString()}</Text>
      <Text fontWeight="semibold">Discount: ₦{(b.discountAmount || 0).toLocaleString()}</Text>
      <Text>Guest pays: ₦{Math.max(0, fullPriceOf(b) - (b.discountAmount || 0)).toLocaleString()}</Text>
    </>
  );

  return (
    <VStack align="stretch" spacing={6}>
      <Box bg="white" borderRadius="md" boxShadow="sm" p={4}>
        <Heading size="sm" mb={3}>
          Waiting for approval ({pending.length})
        </Heading>
        {pending.length === 0 ? (
          <Text color="gray.600">No discounts waiting for approval.</Text>
        ) : (
          <TableContainer>
            <Table size="sm">
              <Thead>
                <Tr>
                  <Th>Guest</Th>
                  <Th>Room &amp; stay</Th>
                  <Th>Price</Th>
                  <Th>Reason</Th>
                  <Th>Given by</Th>
                  <Th></Th>
                </Tr>
              </Thead>
              <Tbody>
                {pending.map((b) => (
                  <Tr key={b._id} verticalAlign="top">
                    <Td>
                      <Text fontWeight="semibold">{b.fullName}</Text>
                      <Text fontSize="xs" color="gray.600">
                        {b.phone}
                      </Text>
                    </Td>
                    <Td>
                      <Text>{b.roomName}</Text>
                      <Text fontSize="xs" color="gray.600">
                        {showDay(b.startDate)} → {showDay(b.endDate)} · {b.nights} night{b.nights === 1 ? "" : "s"}
                      </Text>
                    </Td>
                    <Td fontSize="sm">{priceLines(b)}</Td>
                    <Td whiteSpace="normal" maxW="220px" fontSize="sm">
                      {b.discountReason}
                    </Td>
                    <Td fontSize="xs">
                      <Text>{b.discountRequestedBy}</Text>
                      <Text color="gray.600">{b.discountRequestedAt && showDateTime(b.discountRequestedAt)}</Text>
                    </Td>
                    <Td>
                      <Flex gap={2}>
                        <Button size="sm" colorScheme="green" onClick={() => decide(b, "approve")} isDisabled={busy}>
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          colorScheme="red"
                          variant="outline"
                          onClick={() => {
                            setNote("");
                            setError("");
                            setRejecting(b);
                          }}
                          isDisabled={busy}
                        >
                          Reject
                        </Button>
                      </Flex>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
        )}
      </Box>

      <Box bg="white" borderRadius="md" boxShadow="sm" p={4}>
        <Heading size="sm" mb={3}>
          Decided
        </Heading>
        {decided.length === 0 ? (
          <Text color="gray.600">No decisions yet.</Text>
        ) : (
          <TableContainer>
            <Table size="sm">
              <Thead>
                <Tr>
                  <Th>Decision</Th>
                  <Th>Guest</Th>
                  <Th>Room</Th>
                  <Th>Price</Th>
                  <Th>Reason</Th>
                  <Th>Decided by</Th>
                </Tr>
              </Thead>
              <Tbody>
                {decided.map((b) => (
                  <Tr key={b._id} verticalAlign="top">
                    <Td>
                      <Badge colorScheme={b.discountStatus === "approved" ? "green" : "red"}>{b.discountStatus}</Badge>
                    </Td>
                    <Td>{b.fullName}</Td>
                    <Td>{b.roomName}</Td>
                    <Td fontSize="sm">{priceLines(b)}</Td>
                    <Td whiteSpace="normal" maxW="220px" fontSize="sm">
                      <Text>{b.discountReason}</Text>
                      {b.discountNote && (
                        <Text color="gray.600" mt={1}>
                          Manager: {b.discountNote}
                        </Text>
                      )}
                    </Td>
                    <Td fontSize="xs">
                      <Text>{b.discountDecidedBy}</Text>
                      <Text color="gray.600">{b.discountDecidedAt && showDateTime(b.discountDecidedAt)}</Text>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
        )}
      </Box>

      <Modal isOpen={!!rejecting} onClose={() => setRejecting(null)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Reject discount</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {rejecting && (
              <Text mb={3}>
                {rejecting.fullName} · {rejecting.roomName}: the ₦{(rejecting.discountAmount || 0).toLocaleString()} discount will not
                apply, and the guest owes the full ₦{fullPriceOf(rejecting).toLocaleString()}.
              </Text>
            )}
            <FormControl isRequired>
              <FormLabel>Why? (the receptionist will see this)</FormLabel>
              <Textarea value={note} maxLength={300} onChange={(e) => setNote(e.target.value)} />
            </FormControl>
            {error && (
              <Text color="red.500" fontSize="sm" mt={2}>
                {error}
              </Text>
            )}
          </ModalBody>
          <ModalFooter>
            <Button
              colorScheme="red"
              mr={3}
              onClick={() => rejecting && decide(rejecting, "reject", note)}
              isLoading={busy}
              isDisabled={busy || note.trim().length < 3}
            >
              Reject discount
            </Button>
            <Button onClick={() => setRejecting(null)}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </VStack>
  );
}

function BookingHistory({ onSessionLost }: { onSessionLost: () => void }) {
  const [entries, setEntries] = useState<AuditEntry[] | null>(null);

  useEffect(() => {
    api("/manager/audit?type=bookings").then(({ ok, status, data }) => {
      if (status === 401) return onSessionLost();
      setEntries(ok ? data : []);
    });
  }, [onSessionLost]);

  if (!entries) return <Spinner />;

  return (
    <Box bg="white" borderRadius="md" boxShadow="sm" p={4}>
      <Text color="gray.600" fontSize="sm" mb={3}>
        Every booking added at the front desk, and every booking cancelled, marked paid, edited or deleted. Newest first.
      </Text>
      <TableContainer>
        <Table size="sm">
          <Thead>
            <Tr>
              <Th>When</Th>
              <Th>Who</Th>
              <Th>What</Th>
              <Th>Booking</Th>
              <Th>Details</Th>
            </Tr>
          </Thead>
          <Tbody>
            {entries.map((e, i) => (
              <Tr key={i} verticalAlign="top">
                <Td whiteSpace="nowrap">{new Date(e.at).toLocaleString()}</Td>
                <Td>{e.actor}</Td>
                <Td>
                  <Badge colorScheme={actionColor(e.action)}>{ACTION_LABELS[e.action] || e.action}</Badge>
                </Td>
                <Td fontWeight="semibold" whiteSpace="normal">
                  {e.details && "name" in e.details
                    ? String(e.details.name)
                    : e.details && "count" in e.details
                      ? `${String(e.details.count)} bookings`
                      : ""}
                </Td>
                <Td fontSize="xs" whiteSpace="normal" minW="260px">
                  {e.details?.reason ? (
                    <Text mb={1}>
                      <strong>Reason:</strong> {String(e.details.reason)}
                    </Text>
                  ) : null}
                  {e.details?.amount ? (
                    <Text mb={1}>
                      <strong>Discount:</strong> ₦{Number(e.details.amount).toLocaleString()}
                      {e.details.requestedBy ? ` (given by ${String(e.details.requestedBy)})` : ""}
                    </Text>
                  ) : null}
                  {e.details?.note ? (
                    <Text mb={1}>
                      <strong>Manager&apos;s note:</strong> {String(e.details.note)}
                    </Text>
                  ) : null}
                  {e.details?.payBy ? (
                    <Text mb={1}>
                      <strong>Reason:</strong> not paid by {String(e.details.payBy)} (12 hours before check-in)
                    </Text>
                  ) : null}
                  {describeChanges(e.details).map((line) => (
                    <Text key={line}>{line}</Text>
                  ))}
                  {(e.action === "booking.delete" || e.action === "booking.expire") &&
                    describeBooking(e.details).map((line) => (
                      <Text key={line} color="gray.600">
                        {line}
                      </Text>
                    ))}
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
      {entries.length === 0 && <Text color="gray.600">No booking changes yet.</Text>}
    </Box>
  );
}

// ---------- Staff login (the Google Authenticator receptionists use on /dashboard) ----------
type StaffAuthStatus = { configured: boolean; setAt: string | null; setBy: string | null; lockedUntil: string | null };
type StaffAuthSetup = { qr: string; secret: string; label: string; expiresAt: string };

function StaffLoginSetup({ onSessionLost }: { onSessionLost: () => void }) {
  const [status, setStatus] = useState<StaffAuthStatus | null>(null);
  const [setup, setSetup] = useState<StaffAuthSetup | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const toast = useToast();
  const { busy, run } = useSingleFlight();

  const loadStatus = useCallback(async () => {
    const { ok, status: httpStatus, data } = await api("/manager/staff-authenticator");
    if (httpStatus === 401) return onSessionLost();
    if (ok) setStatus(data);
  }, [onSessionLost]);

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  const start = () =>
    run(async () => {
      setError("");
      setCode("");
      const { ok, status: httpStatus, data } = await api("/manager/staff-authenticator/new", "POST");
      if (httpStatus === 401) return onSessionLost();
      if (!ok) {
        setError(data.message || "Could not create a new authenticator.");
        return;
      }
      setSetup(data);
    });

  const confirm = () =>
    run(async () => {
      setError("");
      const { ok, status: httpStatus, data } = await api("/manager/staff-authenticator/confirm", "POST", { code });
      if (httpStatus === 401 && data.message === "Manager sign-in required") return onSessionLost();
      if (!ok) {
        setError(data.message || "Could not activate the new authenticator.");
        return;
      }
      setSetup(null);
      setCode("");
      toast({
        title: "New staff authenticator is active.",
        description: "The old code no longer works, and staff were signed out of the bookings dashboard.",
        status: "success",
        duration: 8000,
      });
      loadStatus();
    });

  const cancel = () =>
    run(async () => {
      await api("/manager/staff-authenticator/cancel", "POST");
      setSetup(null);
      setCode("");
      setError("");
    });

  if (!status) return <Spinner />;

  return (
    <Box bg="white" borderRadius="md" boxShadow="sm" p={{ base: 4, md: 6 }} maxW="720px">
      <Heading size="md" mb={2}>
        Staff login (Google Authenticator)
      </Heading>
      <Text color="gray.600" mb={4}>
        Receptionists log in to the bookings dashboard with the 6-digit code from the Google Authenticator app. Create a new
        authenticator when you set up a new front-desk phone, or when a phone is lost or a staff member leaves.
      </Text>

      {status.configured ? (
        <Text mb={4}>
          <strong>Current authenticator:</strong>{" "}
          {status.setAt ? `set up ${showDateTime(status.setAt)}${status.setBy ? ` by ${status.setBy}` : ""}` : "set up before this page existed"}
        </Text>
      ) : (
        <Alert status="warning" mb={4} borderRadius="md">
          <AlertIcon />
          Staff login is not set up yet, so receptionists can&apos;t log in. Create an authenticator below.
        </Alert>
      )}

      {status.lockedUntil && (
        <Alert status="error" mb={4} borderRadius="md">
          <AlertIcon />
          Staff login is paused until {showDateTime(status.lockedUntil)} because of too many wrong codes. Creating a new
          authenticator lifts the pause.
        </Alert>
      )}

      {!setup ? (
        <>
          <Button colorScheme="teal" onClick={start} isLoading={busy} loadingText="Creating...">
            Create new authenticator
          </Button>
          {error && (
            <Text color="red.500" fontSize="sm" mt={2}>
              {error}
            </Text>
          )}
        </>
      ) : (
        <VStack align="stretch" spacing={4} borderTop="1px solid" borderColor="gray.200" pt={4}>
          <Box>
            <Text fontWeight="semibold">1. Scan this QR code</Text>
            <Text fontSize="sm" color="gray.600">
              On the front-desk phone, open Google Authenticator, tap <strong>+</strong>, then <strong>Scan a QR code</strong>. It
              will be listed as &quot;{setup.label}&quot;.
            </Text>
            <Image src={setup.qr} alt="QR code for the new staff authenticator" boxSize="200px" my={2} />
            <Text fontSize="sm" color="gray.600">
              Can&apos;t scan? Choose <strong>Enter a setup key</strong> and type:
            </Text>
            <Text fontFamily="mono" fontSize="md" letterSpacing="wider" wordBreak="break-all">
              {setup.secret.match(/.{1,4}/g)?.join(" ")}
            </Text>
            <Text fontSize="xs" color="gray.500" mt={1}>
              This QR code expires at {showDateTime(setup.expiresAt)}. Don&apos;t screenshot or share it.
            </Text>
          </Box>

          <FormControl>
            <FormLabel fontWeight="semibold">2. Type the 6-digit code the phone now shows</FormLabel>
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="123456"
              maxW="200px"
              fontFamily="mono"
              fontSize="lg"
            />
          </FormControl>

          {status.configured && (
            <Alert status="info" borderRadius="md" fontSize="sm">
              <AlertIcon />
              When you activate it, the old code stops working and anyone logged in to the bookings dashboard is signed out.
              Delete the old entry from other staff phones.
            </Alert>
          )}

          {error && (
            <Text color="red.500" fontSize="sm">
              {error}
            </Text>
          )}

          <Flex gap={2} wrap="wrap">
            <Button colorScheme="teal" onClick={confirm} isLoading={busy} isDisabled={busy || code.length !== 6} loadingText="Checking...">
              Activate new authenticator
            </Button>
            <Button onClick={cancel} isDisabled={busy}>
              Cancel
            </Button>
          </Flex>
        </VStack>
      )}
    </Box>
  );
}

function ActivityLog({ onSessionLost }: { onSessionLost: () => void }) {
  const [entries, setEntries] = useState<AuditEntry[] | null>(null);

  useEffect(() => {
    api("/manager/audit").then(({ ok, status, data }) => {
      if (status === 401) return onSessionLost();
      setEntries(ok ? data : []);
    });
  }, [onSessionLost]);

  if (!entries) return <Spinner />;

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
                  <Badge colorScheme={actionColor(e.action)}>
                    {ACTION_LABELS[e.action] || e.action}
                  </Badge>
                </Td>
                <Td fontSize="xs" whiteSpace="normal">
                  <Text fontWeight="semibold">{e.details && "name" in e.details ? String(e.details.name) : ""}</Text>
                  {describeChanges(e.details).map((line) => (
                    <Text key={line}>{line}</Text>
                  ))}
                  {e.details?.note ? <Text>{String(e.details.note)}</Text> : null}
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
