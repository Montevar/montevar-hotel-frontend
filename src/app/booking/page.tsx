"use client";

import { API_BASE_URL } from "@/utils/api";
import {
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  FormControl,
  FormLabel,
  Grid,
  Input,
  Text,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import axios from "axios";
import { Room } from "@/types";
import { AnimatePresence, LineReveal, Reveal, easeLux, motion } from "@/components/motion";
import AvailabilityBar from "@/components/site/AvailabilityBar";
import { Eyebrow, Frame, HOTEL, Photo, naira } from "@/components/site/brand";

// The availability endpoint also returns each room's amenities
type AvailableRoom = Room & { amenities?: string[] };

// Whole nights between two "YYYY-MM-DD" dates (the server does the real pricing)
const nightsBetween = (start: string, end: string) => {
  const n = Math.round((Date.parse(end) - Date.parse(start)) / 86400000);
  return Number.isFinite(n) && n > 0 ? n : 0;
};
const showDate = (d: string) =>
  d ? new Date(`${d}T12:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "";

const smallCaps = { fontSize: "10px", fontWeight: 600, letterSpacing: "0.24em", textTransform: "uppercase" as const, color: "stone.500" };

export default function BookingPage() {
  const [category, setCategory] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [availableRooms, setAvailableRooms] = useState<AvailableRoom[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchNo, setSearchNo] = useState(0); // replays the results entrance on each new search
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [selectedRoom, setSelectedRoom] = useState<AvailableRoom | null>(null);
  const [isBooking, setIsBooking] = useState(false);
  const [isReserving, setIsReserving] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "" });
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const formModal = useDisclosure();
  const toast = useToast();

  const isOpen = formModal.isOpen;
  const onClose = formModal.onClose;
  const mode = isBooking ? "book" : isReserving ? "reserve" : "";
  const nights = nightsBetween(startDate, endDate);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const reference = searchParams.get("reference");

    if (reference) {
      verifyPayment(reference);
      return; // ✅ don't continue with search param logic if verifying payment
    }

    const categoryParam = searchParams.get("category");
    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");

    if (categoryParam) setCategory(categoryParam);
    if (startDateParam) setStartDate(startDateParam);
    if (endDateParam) setEndDate(endDateParam);

    if (categoryParam && startDateParam && endDateParam) {
      // Automatically fetch rooms if all params are present
      setSearching(true);
      axios
        .get(`${API_BASE_URL}/api/rooms/availability`, {
          params: {
            category: categoryParam,
            startDate: startDateParam,
            endDate: endDateParam,
          },
          withCredentials: true, // important for session cookies
        })
        .then((res) => {
          setAvailableRooms(res.data);
          setHasSearched(true);
        })
        .catch((err) => {
          console.error("Auto-fetch error:", err);
          const message = axios.isAxiosError(err) ? err.response?.data?.error : undefined;
          toast({ title: message || "Error fetching rooms", status: "error" });
        })
        .finally(() => setSearching(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAvailability = async () => {
    if (!startDate || !endDate || !category) {
      setSearchError("Please choose your arrival and departure dates and a room type.");
      return;
    }
    setSearchError("");
    setSearching(true);

    try {
      const res = await axios.get(`${API_BASE_URL}/api/rooms/availability`, {
        params: { startDate, endDate, category },
        withCredentials: true, // important for cookies/session support
      });
      setAvailableRooms(res.data);
      setHasSearched(true);
      setSearchNo((n) => n + 1);
    } catch (err) {
      const message = axios.isAxiosError(err) ? err.response?.data?.error : undefined;
      toast({ title: message || "Error fetching rooms", status: "error" });
    } finally {
      setSearching(false);
    }
  };

  const handleSubmit = async () => {
    const { name, email, phone } = formData;
    setFormError("");

    if (!name || !email || !phone || !selectedRoom || !startDate || !endDate) {
      setFormError("Please fill out all fields and select a room.");
      return;
    }

    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!isValidEmail) {
      setFormError("Please enter a valid email address.");
      return;
    }

    setSubmitting(true);
    try {
      let res;
      let payload;

      if (mode === "book") {
        // BOOK: initialize Paystack payment
        payload = {
          fullName: name,
          phone,
          email,
          roomId: selectedRoom._id,
          roomName: selectedRoom.name,
          roomNumber: selectedRoom.roomNumber ?? 0,
          roomPrice: selectedRoom.price,
          amount: selectedRoom.price,
          startDate,
          endDate,
          source: "user",
        };

        res = await fetch(`${API_BASE_URL}/api/bookings/initialize-payment`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        });
      } else {
        // RESERVE: create unpaid booking
        payload = {
          fullName: name,
          phone,
          email,
          roomId: selectedRoom._id,
          roomName: selectedRoom.name,
          roomNumber: selectedRoom.roomNumber ?? 0,
          roomPrice: selectedRoom.price,
          startDate,
          endDate,
          source: "user",
        };

        res = await fetch(`${API_BASE_URL}/api/bookings`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();

      if (!res.ok) {
        console.error("Booking failed:", data);
        setFormError(data.message || "Something went wrong.");
        return;
      }

      if (mode === "book" && data.authorization_url) {
        window.location.href = data.authorization_url;
        return; // keep the button busy while the browser leaves for Paystack
      } else {
        toast({
          title: "Room reserved successfully!",
          description: data.payBy
            ? `NOTE: Please contact us to pay by ${new Date(data.payBy).toLocaleString("en-GB", { timeZone: "Africa/Lagos", dateStyle: "medium", timeStyle: "short" })} (12 hours before check-in). Unpaid reservations are cancelled automatically after that.`
            : "NOTE: Please contact us to make payment 12 hours prior to check-in, in order to avoid cancellation.",
          status: "success",
          duration: 20000,
          isClosable: true,
          position: "top",
        });

        onClose();
        setFormData({ name: "", email: "", phone: "" });
        setAvailableRooms((prev) => prev.filter((room) => room._id !== selectedRoom._id));
      }
    } catch (error) {
      console.error("Submission error:", error);
      setFormError("Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  const verifyPayment = async (reference: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/bookings/verify-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // important for cookies/sessions
        body: JSON.stringify({ reference }),
      });

      const data = await res.json();

      if (data.verified && data.updated) {
        toast({
          title: data.conflict ? "Payment Received" : "Payment Verified",
          description: data.conflict ? data.message : "Your booking has been confirmed.",
          status: data.conflict ? "warning" : "success",
          duration: 10000,
          isClosable: true,
          position: "top",
        });

        // Optional: clean up the URL
        const url = new URL(window.location.href);
        url.searchParams.delete("reference");
        window.history.replaceState({}, document.title, url.toString());
      } else {
        toast({
          title: "Payment Verification Failed",
          description: "Please contact support if your booking is not confirmed.",
          status: "error",
          duration: 10000,
          isClosable: true,
          position: "top",
        });
      }
    } catch (err) {
      console.error("Verification error:", err);
      toast({
        title: "Error verifying payment",
        description: "Something went wrong.",
        status: "error",
        duration: 10000,
        isClosable: true,
        position: "top",
      });
    }
  };

  const handleOpenForm = (room: AvailableRoom, type: "book" | "reserve") => {
    setSelectedRoom(room);
    setIsBooking(type === "book");
    setIsReserving(type === "reserve");
    setFormError("");
    formModal.onOpen();
  };

  return (
    <Box bg="ivory.100" minH="100vh">
      {/* Header band */}
      <Box as="section" position="relative" h={{ base: "58svh", md: "62svh" }} minH="440px" bg="ink.900" overflow="hidden">
        <motion.div
          style={{ position: "absolute", inset: 0 }}
          initial={{ scale: 1.12, opacity: 0.4 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 2.4, ease: easeLux }}
        >
          <Photo src="/images/super-exec.jpeg" alt="A Super Executive room at Montevar Hotel" priority grade="saturate(0.78) contrast(1.06) brightness(0.6) sepia(0.1)" />
        </motion.div>
        <Box position="absolute" inset={0} bgGradient="linear(to-t, rgba(21,22,24,0.88), rgba(21,22,24,0.25) 70%)" />
        <Frame position="relative" h="full" display="flex" flexDirection="column" justifyContent="flex-end" pb={{ base: 12, xl: 28 }}>
          <Reveal onMount delay={0.4}>
            <Eyebrow light>Reservations</Eyebrow>
          </Reveal>
          <Text as="h1" fontFamily="serif" fontWeight={300} color="ivory.100" fontSize={{ base: "48px", md: "84px", xl: "104px" }} lineHeight={0.95} mt={5}>
            <LineReveal onMount delay={0.5} lines={["Reserve", <em key="s">your stay.</em>]} />
          </Text>
          <Reveal onMount delay={1}>
            <Text color="stone.300" mt={6} fontSize="sm" letterSpacing="0.06em">
              Check-in from {HOTEL.checkIn} · Check-out by {HOTEL.checkOut}
            </Text>
          </Reveal>
        </Frame>
      </Box>

      {/* Search */}
      <Frame position="relative" zIndex={2} mt={{ base: 0, xl: "-60px" }} pt={{ base: 8, xl: 0 }}>
        <Reveal onMount delay={1.1}>
          <Box boxShadow={{ xl: "0 30px 60px -30px rgba(21,22,24,0.45)" }}>
            <AvailabilityBar
              startDate={startDate}
              endDate={endDate}
              category={category}
              onStartDate={setStartDate}
              onEndDate={setEndDate}
              onCategory={setCategory}
              onSubmit={handleAvailability}
              error={searchError}
              busy={searching}
            />
          </Box>
        </Reveal>
      </Frame>

      {/* Results */}
      <Frame py={{ base: 16, md: 24 }}>
        {availableRooms.length > 0 ? (
          <>
            <Flex
              justify="space-between"
              align="baseline"
              wrap="wrap"
              gap={3}
              pb={6}
              mb={{ base: 4, md: 8 }}
              borderBottom="1px solid"
              borderColor="line.light"
            >
              <Text fontFamily="serif" fontSize={{ base: "28px", md: "36px" }} color="ink.900">
                {availableRooms.length} {availableRooms.length === 1 ? "room" : "rooms"} available
              </Text>
              <Text {...smallCaps}>
                {category} · {showDate(startDate)} – {showDate(endDate)}
                {nights ? ` · ${nights} night${nights > 1 ? "s" : ""}` : ""}
              </Text>
            </Flex>

            <Box key={searchNo} position="relative">
              {/* Rooms arrive one after another; a reserved room fades out and the rest move up */}
              <AnimatePresence initial mode="popLayout">
                {availableRooms.map((room, index) => (
                  <Grid
                    key={room._id}
                    as={motion.article}
                    layout
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0, transition: { duration: 0.9, ease: easeLux, delay: Math.min(index, 6) * 0.08 } }}
                    exit={{ opacity: 0, transition: { duration: 0.25 } }}
                    templateColumns={{ base: "1fr", md: "5fr 7fr" }}
                    gap={{ base: 6, md: 12 }}
                    py={{ base: 8, md: 10 }}
                    borderBottom="1px solid"
                    borderColor="line.light"
                    bg="ivory.100"
                  >
                    <Box position="relative" overflow="hidden" sx={{ aspectRatio: "4 / 3" }} role="group">
                      <Box position="absolute" inset={0} transition="transform 1.2s cubic-bezier(0.22,1,0.36,1)" _groupHover={{ transform: "scale(1.04)" }}>
                        <Photo src={room.images?.[0] || "/images/default.jpg"} alt={`${room.name} room`} sizes="(max-width: 768px) 100vw, 40vw" />
                      </Box>
                    </Box>

                    <Flex direction="column" justify="space-between" gap={8}>
                      <Box>
                        <Text {...smallCaps} color="champagne.600">
                          {room.category} · Room {room.roomNumber ?? "—"}
                        </Text>
                        <Text as="h2" fontFamily="serif" fontSize={{ base: "38px", md: "48px" }} lineHeight={1} mt={3} color="ink.900">
                          {room.name}
                        </Text>
                        {room.amenities?.length ? (
                          <Text mt={5} fontSize="13px" color="stone.500" letterSpacing="0.04em" lineHeight={1.8}>
                            {room.amenities.join("  ·  ")}
                          </Text>
                        ) : null}
                      </Box>

                      <Box>
                        <Flex align="baseline" gap={3} wrap="wrap">
                          <Text fontFamily="serif" fontSize="34px" color="ink.900">
                            {naira(room.price)}
                          </Text>
                          <Text color="stone.500" fontSize="sm">
                            per night{nights ? ` · ${naira(room.price * nights)} for ${nights} night${nights > 1 ? "s" : ""}` : ""}
                          </Text>
                        </Flex>
                        <Flex gap={3} mt={5} wrap="wrap">
                          <Button variant="lux" onClick={() => handleOpenForm(room, "book")}>
                            Book &amp; pay now
                          </Button>
                          <Button variant="luxOutline" onClick={() => handleOpenForm(room, "reserve")}>
                            Reserve, pay later
                          </Button>
                        </Flex>
                      </Box>
                    </Flex>
                  </Grid>
                ))}
              </AnimatePresence>
            </Box>
          </>
        ) : (
          <Reveal key={hasSearched ? "none" : "start"}>
            <Grid templateColumns={{ base: "1fr", lg: "5fr 7fr" }} gap={{ base: 6, lg: 16 }} py={{ base: 4, md: 8 }}>
              <Text fontFamily="serif" fontSize={{ base: "32px", md: "44px" }} lineHeight={1.1} color="ink.900">
                {hasSearched ? "Nothing free for those dates." : searching ? "Finding your room…" : "Your room is waiting."}
              </Text>
              <Box color="stone.600" lineHeight={1.85}>
                <Text>
                  {hasSearched
                    ? "No rooms in this category are free for those dates. Please try other dates or another category."
                    : "Choose your arrival and departure dates and a room type above to see which rooms are free."}
                </Text>
                <Text mt={4} fontSize="sm" color="stone.500">
                  Book &amp; pay now with Paystack to confirm instantly, or reserve now and pay at least 12 hours before check-in.
                  Questions? Call {HOTEL.phone}.
                </Text>
              </Box>
            </Grid>
          </Reveal>
        )}
      </Frame>

      {/* Guest details */}
      <Drawer isOpen={isOpen} onClose={onClose} placement="right" size="md">
        <DrawerOverlay bg="rgba(21,22,24,0.55)" backdropFilter="blur(2px)" />
        <DrawerContent bg="ivory.100" borderRadius={0}>
          <DrawerCloseButton mt={3} mr={2} />
          <DrawerHeader pt={10} pb={2}>
            <Eyebrow>{mode === "reserve" ? "Reserve, pay later" : "Book & pay now"}</Eyebrow>
            <Text fontFamily="serif" fontWeight={400} fontSize="40px" lineHeight={1.05} mt={4} color="ink.900">
              {selectedRoom?.name}
            </Text>
          </DrawerHeader>

          <DrawerBody>
            {selectedRoom && (
              <Box borderY="1px solid" borderColor="line.light" py={4} my={4}>
                {[
                  ["Room", `${selectedRoom.category} · Room ${selectedRoom.roomNumber ?? "—"}`],
                  ["Stay", `${showDate(startDate)} – ${showDate(endDate)}${nights ? ` (${nights} night${nights > 1 ? "s" : ""})` : ""}`],
                  ["Total", nights ? naira(selectedRoom.price * nights) : `${naira(selectedRoom.price)} per night`],
                ].map(([k, v]) => (
                  <Grid key={k} templateColumns="90px 1fr" py={1.5} fontSize="sm">
                    <Text {...smallCaps} pt="3px">
                      {k}
                    </Text>
                    <Text color="ink.800">{v}</Text>
                  </Grid>
                ))}
              </Box>
            )}

            {[
              { key: "name", label: "Full name", type: "text", auto: "name" },
              { key: "email", label: "Email", type: "email", auto: "email" },
              { key: "phone", label: "Phone number", type: "tel", auto: "tel" },
            ].map((f) => (
              <FormControl key={f.key} mt={6} isRequired>
                <FormLabel {...smallCaps} requiredIndicator={<></>} mb={1}>
                  {f.label}
                </FormLabel>
                <Input
                  variant="flushed"
                  type={f.type}
                  autoComplete={f.auto}
                  value={formData[f.key as keyof typeof formData]}
                  onChange={(e) => setFormData({ ...formData, [f.key]: e.target.value })}
                  borderColor="line.light"
                  focusBorderColor="champagne.500"
                  fontSize="lg"
                  h="48px"
                />
              </FormControl>
            ))}

            <AnimatePresence>
              {formError && (
                <Text
                  as={motion.p}
                  key={formError}
                  role="alert"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  mt={6}
                  fontSize="sm"
                  color="red.700"
                >
                  {formError}
                </Text>
              )}
            </AnimatePresence>

            <Text mt={8} fontSize="sm" color="stone.500" lineHeight={1.7}>
              {mode === "book"
                ? "You’ll be taken to Paystack to pay securely. Your booking is confirmed as soon as the payment goes through."
                : "Your room is held without payment. Please contact us to pay at least 12 hours before check-in, or the reservation is cancelled automatically."}
            </Text>
          </DrawerBody>

          <DrawerFooter
            gap={3}
            borderTop="1px solid"
            borderColor="line.light"
            py={5}
            flexDirection={{ base: "column-reverse", sm: "row" }}
            alignItems="stretch"
          >
            <Button variant="luxOutline" onClick={onClose} isDisabled={submitting} w={{ base: "100%", sm: "auto" }}>
              Cancel
            </Button>
            <Button variant="lux" onClick={handleSubmit} isLoading={submitting} loadingText={mode === "book" ? "Opening Paystack" : "Reserving"} flex={1}>
              {mode === "book" ? "Continue to payment" : "Confirm reservation"}
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </Box>
  );
}
