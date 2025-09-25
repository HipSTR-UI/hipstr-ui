import { FC } from "react";
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, Checkbox } from "@chakra-ui/react";

type DeveloperOptionsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  showIsoallelesTab: boolean;
  onToggleIsoalleles: (checked: boolean) => void;
};

export const DeveloperOptionsModal: FC<DeveloperOptionsModalProps> = ({
  isOpen,
  onClose,
  showIsoallelesTab,
  onToggleIsoalleles,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Developer Options</ModalHeader>
        <ModalBody pb="6">
          <Checkbox isChecked={showIsoallelesTab} onChange={(e) => onToggleIsoalleles(e.target.checked)}>
            Show isoalleles tab
          </Checkbox>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
