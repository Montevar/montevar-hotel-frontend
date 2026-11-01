"use client";

import { API_BASE_URL } from "@/utils/api";
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
import { Room } from "@/types";

export default function BookingPage() {
  const [category, setCategory] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
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
  .then((res) => {
    setAvailableRooms(res.data);
    setHasSearched(true);
  })
  .catch((err) => {
    console.error("Auto-fetch error:", err);
    const message = axios.isAxiosError(err) ? err.response?.data?.error : undefined;
    toast({ title: message || "Error fetching rooms", status: "error" });
  });

  }
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
  setHasSearched(true);
} catch (err) {
  const message = axios.isAxiosError(err) ? err.response?.data?.error : undefined;
  toast({ title: message || "Error fetching rooms", status: "error" });
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
      alert(data.message || "Something went wrong.");
      return;
    }

    if (mode === "book" && data.authorization_url) {
      window.location.href = data.authorization_url;
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
            // The availability endpoint only returns rooms that are free for the chosen dates
            const status = "Available";


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
                    >
                      Reserve
                    </Button>
                    <Button
                      colorScheme="blue"
                      onClick={() => handleOpenForm(room, "book")}
                    >
                      Book Now
                    </Button>
                  </Flex>
                </Box>
              </Box>
            );
          })}
        </SimpleGrid>
      ) : (
        <Text mt={8}>
          {hasSearched
            ? "No rooms in this category are free for those dates. Please try other dates or another category."
            : "Let’s check for available rooms for you…"}
        </Text>
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
