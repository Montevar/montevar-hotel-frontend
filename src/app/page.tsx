'use client';

import {
  Box,
  Heading,
  Text,
  Stack,
  Button,
  Container,
  Flex,
  Image,
  useBreakpointValue,
  SimpleGrid,
  Avatar,
  VStack,
  HStack,
  Divider,
  Input,
  Select,
  useColorModeValue,
  Icon,
  Wrap,
  WrapItem,
  Link as ChakraLink,
} from '@chakra-ui/react';

import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  StarIcon,
  ChevronRightIcon,
} from '@chakra-ui/icons';

import {
  FaHotel,
  FaWifi,
  FaCar,
  FaTv,
  FaTrophy,
  FaEnvelope,
  FaSwimmer,
  FaUtensils,
  FaSpa,
} from 'react-icons/fa';

import { motion } from 'framer-motion';
import Link from 'next/link';

const MotionBox = motion(Box);

export default function HomePage() {
  const fontSize = useBreakpointValue({ base: '3xl', md: '5xl' });
  const bgColor = useColorModeValue('white', 'gray.800');
  const router = useRouter();

  const handleGoToBooking = () => {
  router.push('/booking');
  };

 // State for booking inputs
const [startDate, setStartDate] = useState('');
const [endDate, setEndDate] = useState('');
const [category, setCategory] = useState('');

const videoObjectFit = useBreakpointValue<'cover' | 'contain' | 'fill' | 'none' | 'scale-down'>({
  base: "cover",
  md: "cover",
});

// Booking handler
const handleBookingSearch = () => {
  if (!startDate || !endDate || !category) {
    alert("Please fill out all fields.");
    return;
  }

  const params = new URLSearchParams({
    startDate,
    endDate,
    category,
  });

  router.push(`/booking?${params.toString()}`);
};

return (
  <Box overflowX="hidden"> {/* FIX 1: Prevent horizontal overflow on mobile */}
    <Box
      position="relative"
      height={{ base: "110vh", md: "100vh" }}
      minHeight="600px"
      overflow="hidden"
    >
      <video
        autoPlay
        loop
        muted
        playsInline
        style={{
          width: "100%",
          height: "100%",
          objectFit: videoObjectFit,
          position: "absolute",
          zIndex: -1,
        }}
      >
        <source src="/videos/hotel-ambience.mp4" type="video/mp4" />
      </video>

      <Flex
        align="center"
        justify="center"
        height="100%"
        direction="column"
        bg="blackAlpha.700"
        px={4}
        textAlign="center"
        pt={{ base: 4, md: "env(safe-area-inset-top)" }}
        pb={{ base: 8, md: 0 }}
      >
        <Image
          src="/images/Montevar_logo.png"
          alt="Montevar Hotel Logo"
          boxSize={{ base: "50px", md: "90px" }}
          mb={2}
        />

        <Heading
          color="white"
          fontSize={{ base: "xl", sm: "2xl", md: "4xl", lg: "5xl" }}
          mb={1}
        >
          Welcome to Montevar Hotel
        </Heading>

        <Text
          color="gray.200"
          mt={2}
          fontSize={{ base: "sm", md: "xl" }}
          maxW={{ base: "90%", md: "600px" }}
        >
          Experience luxury and tranquility in the heart of the city
        </Text>

        {/* Booking Bar */}
        <Flex
          direction={{ base: "column", md: "row" }}
          mt={6}
          gap={4}
          bg="whiteAlpha.900"
          p={{ base: 6, md: 6 }}
          rounded="lg"
          shadow="lg"
          flexWrap="wrap"
          justify="center"
          width="100%"
          maxW="800px"
          mx="auto" // FIX 2: Center horizontally
          overflowX="hidden" // FIX 3: Ensure no overflow from children
        >
          <Input
            placeholder="Check-in Date"
            type="date"
            bg="white"
            flex="1"
            width="100%"
            mb={{ base: 4, md: 0 }}
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <Input
            placeholder="Check-out Date"
            type="date"
            bg="white"
            flex="1"
            width="100%"
            mb={{ base: 4, md: 0 }}
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
          <Select
            placeholder="Select Room Type"
            bg="white"
            flex="1"
            width="100%"
            mb={{ base: 4, md: 0 }}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="Standard">Standard</option>
            <option value="Executive">Executive</option>
            <option value="Classic Executive">Classic Executive</option>
            <option value="Super Executive">Super Executive</option>
            <option value="Royal Suite">Royal Suite</option>
          </Select>
          <Button
            colorScheme="teal"
            px={8}
            py={6}
            fontSize="md"
            flexShrink={0}
            width={{ base: "100%", md: "auto" }}
            onClick={handleBookingSearch}
          >
            Check
          </Button>
        </Flex>
      </Flex>
    </Box>

    <Flex
      direction={{ base: "column", md: "row" }}
      align="center"
      maxW="1200px"
      mx="auto"
      my={16}
      px={4}
      gap={8}
      overflowX="hidden" // FIX 4: Ensure the content section doesn't overflow
    >
      {/* Left Image */}
      <Box
        flex="1"
        height={{ base: "300px", md: "400px" }}
        overflow="hidden"
        rounded="2xl"
      >
        <Image
          src="/images/montevar-hotel-exterior.jpg"
          alt="Montevar Hotel Exterior"
          objectFit="cover"
          width="100%"
          height="100%"
        />
      </Box>

      {/* Right Text */}
      <Box flex="1" textAlign={{ base: "center", md: "left" }} px={{ base: 4, md: 0 }}>
        <Heading
          as="h2"
          size={{ base: "lg", md: "2xl" }}
          mb={6}
          position="relative"
          display="inline-block"
          paddingBottom="6px"
          _after={{
            content: '""',
            position: "absolute",
            bottom: "-8px",
            left: 0,
            height: "5px",
            width: { base: "50%", md: "50%" },
            bg: "teal.400",
            borderRadius: "2px",
          }}
        >
          Welcome to Montevar Hotel
        </Heading>

        <Text fontSize="lg" color="gray.700" maxW="600px" mx={{ base: "auto", md: 0 }}>
          We warmly welcome you to Montevar Hotel, where luxury meets comfort and every guest is treated like family. Experience unforgettable moments in our elegant rooms, top-notch amenities, and exceptional service.
        </Text>
      </Box>
    </Flex>
 





      {/* Featured Amenities On-Site */}
      <Box bg="gray.50" py={20}>
        <Container maxW="7xl">
          <Heading size="lg" mb={10} textAlign="center">Featured Amenities On-Site</Heading>
          <SimpleGrid columns={[1, 2, 4]} spacing={10} textAlign="center">
            {[{ icon: FaWifi, label: 'High-Speed Wi-Fi' }, { icon: FaCar, label: 'Valet Parking' }, { icon: FaSwimmer, label: 'Outdoor Pool' }, { icon: FaUtensils, label: 'Fine Dining Restaurant' }].map((item, idx) => (
              <MotionBox key={idx} whileHover={{ y: -5 }}>
                <Icon as={item.icon} w={12} h={12} color="teal.500" />
                <Text mt={3} fontWeight="medium">{item.label}</Text>
              </MotionBox>
            ))}
          </SimpleGrid>
        </Container>
      </Box>



 <Container maxW="7xl" py={20}>
  <Heading size="lg" mb={10} textAlign="center">
    Explore Our Hotel
  </Heading>

  <SimpleGrid columns={[1, 2, 3]} spacing={10}>
    {[
      {
        src: '/images/pool.jpeg',
        text: 'Relax by our crystal clear pool',
        link: '/about#pool-party',
      },
      {
        src: '/images/restaurant.jpeg',
        text: 'Dine in our exquisite restaurant',
        link: '/about#love-feast-valentine-show',
      },
      {
        src: '/images/bar.jpeg',
        text: 'Indulge in our luxury bar',
        link: '/about#gaming-tournament',
      },
    ].map((item, i) => (
      <MotionBox
        key={i}
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.3 }}
      >
        <Image src={item.src} borderRadius="xl" alt={item.text} />
        <Flex align="center" mt={4}>
          <Text fontWeight="medium" mr={2}>{item.text}</Text>
          <Link href={item.link}>
            <ChevronRightIcon
              boxSize={5}
              color="blue.500"
              _hover={{ color: 'blue.700' }}
              cursor="pointer"
            />
          </Link>
        </Flex>
      </MotionBox>
    ))}
  </SimpleGrid>
</Container>


      {/* Awards Section */}
      <Box bg="gray.100" py={20}>
        <Container maxW="7xl" textAlign="center">
          <Heading size="lg" mb={6}>Awards & Recognition</Heading>
          <HStack justify="center" spacing={8} flexWrap="wrap">
            <Icon as={FaTrophy} boxSize={10} color="yellow.500" />
            <Text>Awarded Best Luxury Hotel 2024</Text>
            <Icon as={FaTrophy} boxSize={10} color="yellow.500" />
            <Text>Top Customer Service 2023</Text>
          </HStack>
        </Container>
      </Box>

     

      {/* Rest of your existing sections are kept unchanged below */}

       
          {/* Rooms Showcase */}
<Box bg="gray.100" py={20}>
  <Container maxW="7xl">
    <Heading size="lg" mb={10} textAlign="center">
      Explore Our Rooms
    </Heading>
    <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10}>
      {[
        {
          title: 'Classic Executive',
          description: 'Elegance meets comfort in our Classic Executive rooms with luxurious bedding and ambient lighting.',
          image: '/images/classic-exec.jpeg',
          href: '/rooms/classic-executive',
        },
        {
          title: 'Super Executive',
          description: 'Spacious and serene, our Super Executive rooms are designed for premium relaxation and style.',
          image: '/images/super-exec.jpeg',
          href: '/rooms/super-executive',
        },
        {
          title: 'Royal Suite',
          description: 'Experience ultimate luxury with our Royal Suite featuring separate lounge, and nice views.',
          image: '/images/royal-suite.jpeg',
          href: '/rooms/royal-suite',
        },
      ].map((room, idx) => (
        <MotionBox
          key={idx}
          bg="white"
          borderRadius="xl"
          overflow="hidden"
          shadow="lg"
          whileHover={{ y: -5 }}
        >
          <Image src={room.image} alt={room.title} h="230px" w="full" objectFit="cover" />
          <Box p={6}>
            <Heading size="md" mb={2}>{room.title}</Heading>
            <Text color="gray.600" mb={4}>
              {room.description}
             <ChakraLink as={Link} href="/booking" color="teal.600" ml={2} fontWeight="semibold">
                Learn more <ChevronRightIcon />
              </ChakraLink>


            </Text>
           <Button colorScheme="teal" variant="outline" onClick={handleGoToBooking}>
            Book Now
          </Button>

          </Box>
        </MotionBox>
      ))}
    </SimpleGrid>
  </Container>
</Box>



       {/* Newsletter Section */}
      <Box bg="white" py={20}>
        <Container maxW="4xl" textAlign="center">
          <Heading size="md" mb={4}>Join Our Newsletter</Heading>
          <Text color="gray.600" mb={6}>Get exclusive offers and latest news directly in your inbox.</Text>
          <Flex direction={{ base: 'column', md: 'row' }} gap={4} justify="center">
            <Input placeholder="Enter your email" type="email" bg="gray.50" />
            <Button leftIcon={<FaEnvelope />} colorScheme="teal">Subscribe</Button>
          </Flex>
        </Container>
      </Box>

    {/* Testimonials Section */}
<Box bg="white" py={20}>
  <Container maxW="5xl">
    <Heading size="lg" mb={10} textAlign="center">
      What Our Guests Say
    </Heading>
    <SimpleGrid columns={[1, 2, 3]} spacing={10}>
      {[
        {
          quote: '“A breathtaking experience! The staff were friendly and the rooms were spotless.”',
          name: 'Sandra Ezejifor',
        },
        {
          quote: '“Luxury at its finest. I’ll definitely be back!”',
          name: 'Eseosa',
        },
        {
          quote: '“Clean, peaceful, and the ambience is amazing.”',
          name: 'West Eromosele',
        },
      ].map((t, i) => (
        <Box bg="gray.50" p={6} rounded="lg" shadow="lg" key={i}>
          <Text fontSize="lg">{t.quote}</Text>
          <HStack mt={4} spacing={2} align="center">
            <Avatar name={t.name} size="sm" />
            <Text fontWeight="bold">{t.name}</Text>
            <HStack spacing={0.5}>
              {[...Array(5)].map((_, i) => (
                <StarIcon key={i} color="teal.400" />
              ))}
            </HStack>
          </HStack>
        </Box>
      ))}
    </SimpleGrid>
  </Container>
</Box>


      {/* CTA Section */}
      <Box py={16} textAlign="center" bg="teal.500" color="white">
        <Heading size="md" mb={4}>Ready to book your luxury stay?</Heading>
        <Button size="lg" colorScheme="whiteAlpha" onClick={handleGoToBooking}>Book Now</Button>
        
      </Box>














      {/* Hotel Information */}
      <Box id="hotel-info" bg="white" py={20}>
        <Container maxW="6xl">
          <Heading size="lg" mb={6} textAlign="center">Hotel Information</Heading>
          <SimpleGrid columns={[1, 2]} spacing={10}>
            <Box>
              <Text><strong>Check-in:</strong> 2:00 PM</Text>
              <Text><strong>Check-out:</strong> 12:00 PM</Text>
              <Text><strong>Smoking:</strong> Not Allowed</Text>
              <Text><strong>Pet Policy:</strong> No pets allowed</Text>
            </Box>
            <Box>
              <Text><strong>Parking:</strong> On-site valet parking available</Text>
              <Text><strong>Languages Spoken:</strong> English, French</Text>
              <Text><strong>Payment Options:</strong> Paystack, Visa, MasterCard</Text>
            </Box>
          </SimpleGrid>
        </Container>
      </Box>

 {/* More Ways to Enjoy Your Stay - Refined Layout */}
      <Box bg="gray.50" py={20}>
        <Container maxW="7xl">
          <Heading size="lg" mb={10} textAlign="center">More Ways to Enjoy Your Stay</Heading>

          {/* First Row */}
          <Flex direction={{ base: 'column', md: 'row' }} align="center" gap={0} mb={12} overflow="hidden" borderRadius="2xl" boxShadow="lg">
            <Image src="/images/outdoor-party.jpeg" alt="Outdoor Party" objectFit="cover" h={{ base: '200px', md: '300px' }} flex="1" w="100%" />
            <Box bg="white" p={10} flex="1" h="full">
              <Heading size="md" mb={3}>Outdoor Party & Live Band Performance</Heading>
                            <Text mb={4} color="gray.600">Enjoy the vibrant atmosphere of our outdoor party nights featuring live music, dancing, Karaoke night, standup comedy night and exotic cocktails under the stars.</Text>
              <Button
                as={Link}
                href="/about#pool-party"
                variant="link"
                colorScheme="teal"
              >
                Learn More →
              </Button>
            </Box>
          </Flex>

          {/* Second Row */}
          <Flex direction={{ base: 'column-reverse', md: 'row' }} align="center" gap={0} overflow="hidden" borderRadius="2xl" boxShadow="lg">
            <Box bg="white" p={10} flex="1" h="full">
              <Heading size="md" mb={3}>PlayStation & Snooker Tournament</Heading>
              <Text mb={4} color="gray.600">Challenge your friends or other guests in our cozy game room equipped with PlayStation consoles and professional snooker tables.</Text>
              <Button
                as={Link}
                href="/about#gaming-tournament"
                variant="link"
                colorScheme="teal"
              >
                Learn More →
              </Button>

            </Box>
            <Image src="/images/games-lounge.jpeg" alt="Game Lounge" objectFit="cover" h={{ base: '200px', md: '300px' }} flex="1" w="100%" />
          </Flex>
        </Container>
      </Box>
      {/* Keep rest of the original page unchanged */}


      {/* Contact Section */}
<Box id="contact" bg="blue.900" color="white" py={20}>
  <Container maxW="6xl">
    <Heading size="lg" mb={6} textAlign="center">
      Contact Us
    </Heading>

    <SimpleGrid columns={[1, 2]} spacing={10} alignItems="center">
      {/* Left: Map */}
      <Box>
        <Box
          as="iframe"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d63455.740690730854!2d5.544495948022307!3d6.265861313837151!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1040d1a1e26898ef%3A0xd78dbe6d260d36b0!2sMontevar%20Hotel!5e0!3m2!1sen!2sbj!4v1752833726989!5m2!1sen!2sbj"           width="100%"
          height="300"
          style={{ border: 0 }}
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
        />
      </Box>

      {/* Right: Info */}
      {/* Right: Info */}
<VStack align="start" spacing={4}>
  <Text fontSize="lg">📍 <strong>Montevar Hotel</strong></Text>
  <Text>1 Montevar Street, Ofumwengbe Community Road Benin City, Edo State</Text>
  <Text>🚗 Approx. 10-15 minute drive from Benin Airport</Text>
  <Text>🚕 Airport Taxi Fare: ₦5,000 (estimated)</Text>
  <Text>📞 Call us: <strong>+234 706 099 6380</strong></Text>
  <Text>📧 Email: <strong>montevarhotels@gmail.com</strong></Text>
</VStack>

    </SimpleGrid>
  </Container>
</Box>
    </Box>
  );
}
