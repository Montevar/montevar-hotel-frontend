import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Image,
  Box,
  Text,
  Stack,
} from '@chakra-ui/react';
import { Room } from '@/types'; // adjust if needed

export interface RoomGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  room: Room;
}

const RoomGalleryModal: React.FC<RoomGalleryModalProps> = ({ isOpen, onClose, room }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{room.name} Gallery</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Stack spacing={4}>
            {room.images.map((src, index) => (
              <Box key={index}>
                <Image src={src} alt={`Room image ${index + 1}`} borderRadius="md" />
              </Box>
            ))}
            <Text>Room Number: {room.roomNumber}</Text>
            <Text>Category: {room.category}</Text>
            <Text>Price: ₦{room.price.toLocaleString()}</Text>
          </Stack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default RoomGalleryModal;
