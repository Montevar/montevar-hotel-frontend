"use client";

import {
  Box,
  Button,
  Flex,
  Grid,
  Heading,
  Image,
  Text,
  useDisclosure,
  useToast,
  Badge,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  FormControl,
  FormLabel,
  Input,
  SimpleGrid,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import axios from "axios";
import { getRoomStatus } from "@/utils/getRoomStatus";
import { Booking } from "@/types";

interface Room {
  _id: string;
  name: string;
  price: number;
  roomNumber: number;
  images: string[];
  bookings: Booking[];
}

export default function RoomListingsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [formData, setFormData] = useState({
  name: "",
  phone: "",
  email: "", 
  startDate: "",
  endDate: "",
  });
  const [isBooking, setIsBooking] = useState(false);
  const [isReserving, setIsReserving] = useState(false);

  const toast = useToast();
  const photoModal = useDisclosure();
  const formModal = useDisclosure();

  useEffect(() => {
    const fetchRooms = async () => {
      try {
       const res = await axios.get("http://localhost:3001/api/rooms", {
          withCredentials: true,
        });
        
        setRooms(res.data);
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
        toast({
          title: "Failed to fetch rooms.",
          status: "error",
          description: errorMessage,
          isClosable: true,
        });
      }
    };

    fetchRooms();
  }, [toast]);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        // Bookings (fetch)
          const res = await fetch("http://localhost:3001/api/bookings", {
            credentials: "include",
          });

        const data = await res.json();
        setBookings(data);
      } catch (err) {
        console.error("Failed to fetch bookings", err);
      }
    };

    fetchBookings();
  }, []);

  const openFormModal = (room: Room, type: "book" | "reserve") => {
    setSelectedRoom(room);
    setIsBooking(type === "book");
    setIsReserving(type === "reserve");
    formModal.onOpen();
  };

 const handleSubmit = async () => {
  if (!selectedRoom) return;

const payload = {
  fullName: formData.name,
  phone: formData.phone,
  email: formData.email,
  roomName: selectedRoom?.name || "",
  roomNumber: selectedRoom?.roomNumber ?? -1,
  roomPrice: selectedRoom?.price ?? 0,
  startDate: formData.startDate,
  endDate: formData.endDate,
  isPaid: isBooking,
  source: "dashboard", // ✅ This is critical!
};




  const endpoint = isBooking
    ? "http://localhost:3001/api/bookings/manual"
    : "http://localhost:3001/api/bookings/reserve";

  try {
    await axios.post(endpoint, payload);
    toast({
      title: `${isBooking ? "Booked" : "Reserved"} successfully`,
      status: "success",
    });
    formModal.onClose();
    window.location.reload(); // reload to reflect updated bookings
  } catch (error) {
    toast({
      title: "Error",
      status: "error",
      description: "Could not submit",
    });
    console.error("Booking submission error:", error);
  }
};



  return (
    <Box p={6}>
      <Heading mb={6}>Room Listings</Heading>
      <Grid templateColumns="repeat(auto-fill, minmax(300px, 1fr))" gap={6}>
        {rooms.map((room) => {
          const status = getRoomStatus(room.roomNumber, room.name, bookings);

          return (
            <Box
              key={room._id}
              borderWidth="1px"
              borderRadius="2xl"
              boxShadow="md"
              overflow="hidden"
              bg={status === "Booked" ? "red.50" : status === "Reserved" ? "yellow.50" : "white"}
              position="relative"
            >
              <Image src={room.images[0]} alt={room.name} height="200px" width="100%" objectFit="cover" />
              <Box p={4}>
                <Flex justify="space-between" mb={2}>
                  <Text fontSize="xl" fontWeight="bold">{room.name}</Text>
                  <Text fontWeight="bold">Room #{room.roomNumber}</Text>
                </Flex>
                <Text fontWeight="semibold">₦{room.price.toLocaleString()}</Text>

                {status !== "Available" && (
                  <Badge colorScheme={status === "Booked" ? "red" : "yellow"} mt={2}>
                    {status.toUpperCase()}
                  </Badge>
                )}

                <Flex mt={4} gap={2}>
                  <Button
                    colorScheme="green"
                    flex={1}
                    isDisabled={status !== "Available"}
                    onClick={() => openFormModal(room, "book")}
                  >
                    Book
                  </Button>
                  <Button
                    colorScheme="blue"
                    flex={1}
                    isDisabled={status !== "Available"}
                    onClick={() => openFormModal(room, "reserve")}
                  >
                    Reserve
                  </Button>
                </Flex>

                <Button
                  mt={3}
                  colorScheme="teal"
                  variant="outline"
                  onClick={() => {
                    setSelectedRoom(room);
                    setPhotoIndex(0);
                    photoModal.onOpen();
                  }}
                >
                  View Rooms
                </Button>
              </Box>
            </Box>
          );
        })}
      </Grid>

      {/* Photo Gallery Modal */}
      <Modal isOpen={photoModal.isOpen} onClose={photoModal.onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Photo Gallery</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedRoom && (
              <Flex direction="column" align="center">
                <Image
                  src={selectedRoom.images[photoIndex]}
                  alt="room photo"
                  maxH="400px"
                  objectFit="cover"
                  borderRadius="md"
                />
                <Flex mt={4} justify="space-between" w="full">
                  <Button
                    onClick={() => setPhotoIndex((photoIndex - 1 + selectedRoom.images.length) % selectedRoom.images.length)}
                  >
                    Prev
                  </Button>
                  <Button
                    onClick={() => setPhotoIndex((photoIndex + 1) % selectedRoom.images.length)}
                  >
                    Next
                  </Button>
                </Flex>
              </Flex>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Booking/Reservation Form Modal */}
      <Modal isOpen={formModal.isOpen} onClose={formModal.onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{isBooking ? "Book Room" : "Reserve Room"}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text fontWeight="bold" mb={2}>
              {selectedRoom?.name} - Room #{selectedRoom?.roomNumber} - ₦{selectedRoom?.price.toLocaleString()}
            </Text>

            <FormControl mb={3}>
              <FormLabel>Your Name</FormLabel>
              <Input
                placeholder="e.g. John Doe"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </FormControl>

            <FormControl mb={3}>
              <FormLabel>Email Address</FormLabel>
              <Input
                type="email"
                placeholder="e.g. john@example.com"
                value={formData.email || ""}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </FormControl>


            <FormControl mb={3}>
              <FormLabel>Phone Number</FormLabel>
              <Input
                type="tel"
                placeholder="e.g. 08012345678"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </FormControl>

            <SimpleGrid columns={2} spacing={4}>
              <FormControl>
                <FormLabel>Start Date</FormLabel>
                <Input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </FormControl>

              <FormControl>
                <FormLabel>End Date</FormLabel>
                <Input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </FormControl>
            </SimpleGrid>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="teal" mr={3} onClick={handleSubmit}>
              Submit
            </Button>
            <Button onClick={formModal.onClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
