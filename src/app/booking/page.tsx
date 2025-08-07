"use client";

import { API_BASE_URL } from "@/utils/api";
import { getRoomStatus } from "@/utils/getRoomStatus";
import {
  Box,
  Button,
  Flex,
  Heading,
  Image,
  Input,
  Select,
  SimpleGrid,
  Text,
  useDisclosure,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import axios from "axios";
import { Room, Booking } from "@/types";

export default function BookingPage() {
  const [category, setCategory] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [isBooking, setIsBooking] = useState(false);
  const [isReserving, setIsReserving] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "" });

  const formModal = useDisclosure();
  const toast = useToast();

  const isOpen = formModal.isOpen;
  const onClose = formModal.onClose;
  const mode = isBooking ? "book" : isReserving ? "reserve" : "";

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
    axios
  .get(`${API_BASE_URL}/api/rooms/availability`, {
    params: {
      category: categoryParam,
      startDate: startDateParam,
      endDate: endDateParam,
    },
    withCredentials: true, // important for session cookies
  })
  .then((res) => setAvailableRooms(res.data))
  .catch((err) => {
    console.error("Auto-fetch error:", err);
    toast({ title: "Error fetching rooms", status: "error" });
  });

  }
}, []);




  useEffect(() => {
  fetch(`${API_BASE_URL}/api/bookings`, {
    credentials: "include", // if you're using sessions/cookies
  })
    .then((res) => res.json())
    .then((data) => setBookings(data))
    .catch((err) => console.error("Failed to fetch bookings:", err));
}, []);

 const handleAvailability = async () => {
  if (!startDate || !endDate || !category) {
    toast({ title: "Please fill start date, end date, and category", status: "warning" });
    return;
  }

  try {
  const res = await axios.get(`${API_BASE_URL}/api/rooms/availability`, {
    params: { startDate, endDate, category },
    withCredentials: true, // important for cookies/session support
  });
  setAvailableRooms(res.data);
} catch {
  toast({ title: "Error fetching rooms", status: "error" });
}

};


  

  const handleSubmit = async () => {
  const { name, email, phone } = formData;

  if (!name || !email || !phone || !selectedRoom || !startDate || !endDate) {
    alert("Please fill out all fields and select a room.");
    return;
  }

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!isValidEmail) {
    alert("Please enter a valid email address.");
    return;
  }

  try {
    let res;
    let payload;

    if (mode === "book") {
      payload = {
        fullName: name,
        phone: phone,
        email,
        roomId: selectedRoom._id,
        roomName: selectedRoom.name,
        roomNumber: selectedRoom.roomNumber ?? 0,
        roomPrice: selectedRoom.price,  // <--- roomPrice here, not price
        amount: selectedRoom.price,
        startDate,
        endDate,
        source: "user",
      };

  res = await fetch(`${API_BASE_URL}/api/bookings`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  credentials: "include",   // add this if using cookies/sessions
  body: JSON.stringify(payload),
});

}


    else {
      payload = {
        fullName: name,
        phone: phone,
        email,
        roomId: selectedRoom._id,
        roomName: selectedRoom.name,
        roomNumber: selectedRoom.roomNumber ?? 0,
        roomPrice: selectedRoom.price,  // <--- roomPrice here too
        startDate,
        endDate,
        source: "user",
      };

     res = await fetch(`${API_BASE_URL}/api/bookings/reserve`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  credentials: "include", // <-- important for cookies/session
  body: JSON.stringify(payload),
});

    }

    const data = await res.json();

    if (!res.ok) {
      console.error("Booking failed:", data);
      alert(data.message || "Something went wrong.");
      return;
    }

    if (mode === "book" && data.authorization_url) {
      window.location.href = data.authorization_url;
    } else {
      toast({
        title: "Room reserved successfully!",
        description: "NOTE: Please contact us to make payment before arrival.",
        status: "success",
        duration: 20000,
        isClosable: true,
        position: "top",
      });

      onClose();
      setFormData({ name: "", email: "", phone: "" });
      setAvailableRooms((prev) =>
        prev.filter((room) => room._id !== selectedRoom._id)
      );
    }
  } catch (error) {
    console.error("Submission error:", error);
    alert("Something went wrong.");
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
        title: "Payment Verified",
        description: "Your booking has been confirmed.",
        status: "success",
        duration: 10000,
        isClosable: true,
        position: "top",
      });

      // Refresh bookings to reflect isPaid = true
        const bookingRes = await fetch(`${API_BASE_URL}/api/bookings`, {
        credentials: "include", // for sessions/cookies
        });
        const bookingData = await bookingRes.json();
        setBookings(bookingData);


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




  const handleOpenForm = (room: Room, type: "book" | "reserve") => {
    setSelectedRoom(room);
    setIsBooking(type === "book");
    setIsReserving(type === "reserve");
    formModal.onOpen();
  };

 


  return (
    <Box p={4}>
      <Heading mb={4}>Check Room Availability</Heading>
      <Flex gap={4} wrap="wrap">
        <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        <Select placeholder="Select Category" value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="Standard">Standard</option>
          <option value="Executive">Executive</option>
          <option value="Classic Executive">Classic Executive</option>
          <option value="Super Executive">Super Executive</option>
          <option value="Royal Suite">Royal Suite</option>
        </Select>
        <Button onClick={handleAvailability} colorScheme="teal">
          Check Availability
        </Button>
      </Flex>

      {availableRooms.length > 0 ? (
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mt={8}>
          {availableRooms.map((room) => {
            const status = getRoomStatus(Number(room.roomNumber), room.name, bookings);


            return (
              <Box key={room._id} borderWidth="1px" borderRadius="lg" overflow="hidden">
                <Image
                  src={room.images?.[0] || "/images/default.jpg"}
                  alt={room.name}
                  boxSize="300px"
                  objectFit="cover"
                  width="100%"
                />
                <Box p={4}>
                  <Text fontSize="xl" fontWeight="bold">{room.name}</Text>
                  <Text>Category: {room.category}</Text>
                  <Text>Price: ₦{room.price.toLocaleString()}</Text>
                  <Text>Room #: {room.roomNumber ?? "—"}</Text>
                  <Text>Status: {status}</Text>
                  <Flex mt={3} gap={3}>
                    <Button
                      colorScheme="yellow"
                      onClick={() => handleOpenForm(room, "reserve")}
                      isDisabled={status !== "Available"}
                    >
                      {status === "Reserved" ? "Reserved" : "Reserve"}
                    </Button>
                    <Button
                      colorScheme="blue"
                      onClick={() => handleOpenForm(room, "book")}
                      isDisabled={status !== "Available"}
                    >
                      {status === "Booked" ? "Booked" : "Book Now"}
                    </Button>
                  </Flex>
                </Box>
              </Box>
            );
          })}
        </SimpleGrid>
      ) : (
        <Text mt={8}>Let’s check for available rooms for you…</Text>
      )}

      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{mode === "reserve" ? "Reserve Room" : "Book Room"}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Input
              placeholder="Your Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              mb={3}
            />
            <Input
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              mb={3}
            />
            <Input
              placeholder="Phone Number"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="teal" mr={3} onClick={handleSubmit}>
              Submit
            </Button>
            <Button onClick={onClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
