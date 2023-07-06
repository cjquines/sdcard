import {
  Button,
  ButtonProps,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
} from "@chakra-ui/react";
import { useRef } from "react";

export default function SimpleModal(
  props: {
    open: string;
    title: string;
    cancel?: string;
    confirm?: string;
    beforeOpen?: () => void;
    onConfirm?: () => void;
  } & ButtonProps,
) {
  const { open, title, cancel, confirm, beforeOpen, onConfirm, children } =
    props;
  const { isOpen, onOpen, onClose } = useDisclosure();
  const btnRef = useRef<HTMLButtonElement>(null);

  return (
    <>
      <Button
        {...props}
        ref={btnRef}
        onClick={() => {
          beforeOpen?.();
          onOpen();
        }}
      >
        {open}
      </Button>
      <Modal isOpen={isOpen} onClose={onClose} finalFocusRef={btnRef}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{title}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>{children}</ModalBody>
          <ModalFooter>
            <Button onClick={onClose} mr={confirm ? 2 : 0}>
              {cancel || "Cancel"}
            </Button>
            {confirm ? (
              <Button
                onClick={() => {
                  onConfirm?.();
                  onClose();
                }}
              >
                {confirm}
              </Button>
            ) : null}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
