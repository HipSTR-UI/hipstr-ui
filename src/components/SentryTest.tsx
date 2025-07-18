import React from "react";
import { Button, VStack, Text, useToast } from "@chakra-ui/react";
import { useSentry } from "../hooks/useSentry";

export const SentryTest: React.FC = () => {
  const { captureError, captureMessage, setUser, setTag } = useSentry();
  const toast = useToast();

  const testErrorCapture = () => {
    try {
      throw new Error("This is a test error for Sentry");
    } catch (error) {
      captureError(error as Error, {
        component: "SentryTest",
        action: "test-error-capture",
        test: true,
      });
      toast({
        title: "Error captured",
        description: "Check your Sentry dashboard for the error",
        status: "success",
        duration: 3000,
      });
    }
  };

  const testMessageCapture = () => {
    captureMessage("This is a test message for Sentry", "info");
    toast({
      title: "Message captured",
      description: "Check your Sentry dashboard for the message",
      status: "success",
      duration: 3000,
    });
  };

  const testUserContext = () => {
    setUser({
      id: "test-user-123",
      email: "test@example.com",
      username: "testuser",
    });
    toast({
      title: "User context set",
      description: "User information has been set for Sentry",
      status: "success",
      duration: 3000,
    });
  };

  const testTags = () => {
    setTag("test-tag", "test-value");
    setTag("component", "SentryTest");
    toast({
      title: "Tags set",
      description: "Tags have been set for Sentry",
      status: "success",
      duration: 3000,
    });
  };

  const testUnhandledError = () => {
    // This will trigger the error boundary
    throw new Error("This is an unhandled error for testing");
  };

  return (
    <VStack spacing={4} p={4}>
      <Text fontSize="lg" fontWeight="bold">
        Sentry Test Component
      </Text>
      <Text fontSize="sm" color="gray.600">
        Use these buttons to test Sentry error tracking
      </Text>

      <Button onClick={testErrorCapture} colorScheme="red">
        Test Error Capture
      </Button>

      <Button onClick={testMessageCapture} colorScheme="blue">
        Test Message Capture
      </Button>

      <Button onClick={testUserContext} colorScheme="green">
        Test User Context
      </Button>

      <Button onClick={testTags} colorScheme="purple">
        Test Tags
      </Button>

      <Button onClick={testUnhandledError} colorScheme="orange">
        Test Unhandled Error (Error Boundary)
      </Button>
    </VStack>
  );
};
