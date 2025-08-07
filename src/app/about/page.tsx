// src/app/about/page.tsx
'use client';

import React from 'react';
import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  Image,
  VStack,
  Container,
  Divider,
  useBreakpointValue,
  Icon,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { FaGlassCheers, FaLaughSquint, FaMusic, FaHeart, FaHeadphones, FaPeopleArrows } from "react-icons/fa";
import NewsletterSection from '../../components/NewsletterSection';

const events = [
  {
    title: "Pool Party",
    description: "A vibrant summer evening filled with music, lights, drinks, and laughter.",
    images: ["/images/pool1.jpg", "/images/pool2.jpg", "/images/pool3.jpg", "/images/pool4.jpg", "/images/pool5.jpg"],
  },
  {
    title: "Love & Feast Valentine Show",
    description: "A romantic celebration with live music, gourmet dining, and unforgettable memories.",
    images: ["/images/val1.jpg", "/images/val2.jpg", "/images/val3.jpg", "/images/val4.jpg", "/images/val5.jpg"],
  },
  {
    title: "Gaming Tournament",
    description: "Intense and thrilling snooker and PlayStation tournaments with incredible prizes and cheering crowds, and live football matches with friends",
    images: ["/images/game1.jpg", "/images/game2.jpg", "/images/game3.jpg", "/images/game4.jpg", "/images/game5.jpg"],
  },
];

const weeklyActivities = [
  {
    day: "Wednesday",
    title: "Ladie's Night, Pool Party & Karaoke",
    icon: FaGlassCheers,
    color: "pink.400",
  },
  {
    day: "Thursday",
    title: "Old School Highlights",
    icon: FaHeadphones,
    color: "orange.400",
  },
  {
    day: "Friday",
    title: "Comedy Club Night",
    icon: FaLaughSquint,
    color: "yellow.400",
  },
  {
    day: "Saturday",
    title: "Live Band Music",
    icon: FaMusic,
    color: "teal.400",
  },
  {
    day: "Sunday",
    title: "Afrobeats & Amapiano Night",
    icon: FaPeopleArrows,
    color: "purple.500",
  },
];

export default function AboutPage() {
  const isMobile = useBreakpointValue({ base: true, md: false });

  return (
    <Box>
      {/* Static Hero Image */}
      <Box position="relative" h={{ base: "200px", md: "400px" }} w="100%">
        <Image
          src="/images/top1.jpeg"
          alt="Montevar Hotel"
          objectFit="cover"
          w="100%"
          h="100%"
        />
        <Heading
          position="absolute"
          top="50%"
          left="50%"
          transform="translate(-50%, -50%)"
          color="white"
          fontSize={{ base: "2xl", md: "5xl" }}
          bg="rgba(0,0,0,0.5)"
          px={4}
          py={2}
          borderRadius="md"
        >
          Welcome to Montevar Hotel
        </Heading>
      </Box>

      {/* Manifesto */}
      <Container maxW="6xl" py={10}>
        <VStack spacing={6} textAlign="center">
          <Heading fontSize={{ base: "2xl", md: "4xl" }}>
            Experience the Soul of Hospitality
          </Heading>
          <Text fontSize={{ base: "md", md: "lg" }} color="gray.600">
            At Montevar Hotel, luxury meets comfort in every corner. Nestled in the heart of Benin, we’ve crafted a
            serene escape where every guest becomes family. Whether you’re here for a romantic getaway, a celebration,
            or a retreat from the ordinary, Montevar is where moments turn into memories. Every room, every meal, and
            every smile is infused with the warmth and class that define us. Welcome to your home away from home.
          </Text>
        </VStack>
      </Container>

      {/* Event Galleries */}
      <Box bg="gray.50" py={10}>
        <Container maxW="6xl">
         {events.map((event, idx) => (
                <Box
                    key={idx}
                    id={event.title.toLowerCase().replace(/[^\w]+/g, "-")} // Add this line for anchor scrolling
                    mb={12}
                >

              <Heading size="lg" mb={2} textAlign={{ base: "center", md: "left" }}>
                {event.title}
              </Heading>
              <Text color="gray.600" mb={4} textAlign={{ base: "center", md: "left" }}>
                {event.description}
              </Text>
              <SimpleGrid columns={{ base: 1, sm: 2, md: 5 }} spacing={4}>
                {event.images.map((img, imgIdx) => (
                  <motion.div
                    key={imgIdx}
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Image
                      src={img}
                      alt={`Event ${event.title} ${imgIdx + 1}`}
                      borderRadius="lg"
                      h={isMobile ? "180px" : "220px"}
                      objectFit="cover"
                      w="full"
                    />
                  </motion.div>
                ))}
              </SimpleGrid>
            </Box>
          ))}
        </Container>
      </Box>

      {/* Weekly Activities */}
      <Box py={16} bg="white">
        <Container maxW="6xl">
          <VStack spacing={8} textAlign="center">
            <Heading fontSize={{ base: "2xl", md: "3xl" }}>
              Weekly Activities at Montevar
            </Heading>
            <Text color="gray.600" fontSize={{ base: "md", md: "lg" }}>
              Every night holds something special — come and celebrate with us!
            </Text>
          </VStack>

          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8} mt={10}>
            {weeklyActivities.map((activity, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -5 }}
                transition={{ duration: 0.3 }}
              >
                <Box
                  p={6}
                  borderRadius="lg"
                  boxShadow="lg"
                  textAlign="center"
                  bg="gray.50"
                  _hover={{ bg: "gray.100" }}
                >
                  <Icon as={activity.icon} boxSize={10} color={activity.color} mb={3} />
                  <Heading size="md" mb={1}>{activity.day}</Heading>
                  <Text fontWeight="medium" color="gray.700">
                    {activity.title}
                  </Text>
                </Box>
              </motion.div>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      <Divider my={10} />

      {/* Newsletter Section */}
      <NewsletterSection />
    </Box>
  );
}
