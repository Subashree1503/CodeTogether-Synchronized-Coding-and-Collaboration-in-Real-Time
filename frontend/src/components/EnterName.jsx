import React, { useRef, useState } from 'react';
import {
  Input,
  Button,
  InputGroup,
  InputRightElement,
  useToast,
  Flex,
  Box,
} from '@chakra-ui/react';
import { useMutation } from 'react-query';
import { useStore } from '../store';
import axios from 'axios';

const EnterName = () => {
  const inputRef = useRef();
  const [isGeneratingRoom, setIsGeneratingRoom] = useState(false);
  const toast = useToast();
  const { setUsername, setRoomId } = useStore(({ setUsername, setRoomId }) => ({
    setUsername,
    setRoomId,
  }));

  const { mutateAsync } = useMutation(({ username, roomId, uri }) => {
    return axios.post(`http://localhost:3001/${uri}`, {
      username,
      roomId,
    });
  });

  const createRoom = async () => {
    setIsGeneratingRoom(true); // Set the loading state
    try {
      const { data } = await axios.post(`http://localhost:3001/generate-room`);
      setRoomId(data.roomId);
      setUsername(inputRef.current.value);
      setIsGeneratingRoom(false); // Reset the loading state
      toast({
        title: 'Room created successfully!',
        status: 'success',
        duration: 9000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error generating room:', error);
      setIsGeneratingRoom(false); // Reset the loading state
      toast({
        title: 'Error generating room',
        status: 'error',
        duration: 9000,
        isClosable: true,
      });
    }
  };

  const joinRoom = async (roomId) => {
    const username = inputRef.current?.value;
    if (!username || !roomId) {
      toast({
        title: 'Please enter your username and room ID',
        status: 'error',
        duration: 9000,
        isClosable: true,
      });
      return;
    }
    setRoomId(roomId);
    setUsername(username);
  };

  return (
    <>
      <InputGroup size="lg">
        <Input
          pr="4.5rem"
          size="lg"
          placeholder="Enter your name"
          ref={inputRef}
        />
        <InputRightElement width="4.5rem">
          <Flex direction="row">
            <Box mr={2}>
              <Button size="lg" onClick={createRoom} isLoading={isGeneratingRoom}>
                Generate Room
              </Button>
            </Box>
            <Box>
              <Button size="lg" onClick={() => joinRoom('your_room_id')}>
                Join Room
              </Button>
            </Box>
          </Flex>
        </InputRightElement>
      </InputGroup>
    </>
  );
};

export default EnterName;