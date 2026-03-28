import ComponentCard from "../../common/ComponentCard";
import { useModal } from "../../../hooks/useModal";
import { Modal } from "../../ui/modal";
import Button from "../../ui/button/Button";

export default function DefaultModal() {
  const { isOpen, openModal, closeModal } = useModal();
  const handleSave = () => {
    // Handle save logic here
    console.log("Saving changes...");
    closeModal();
  };
  return (
    <div>
      <ComponentCard title="Default Modal">
        <Button size="sm" onClick={openModal}>
          Open Modal
        </Button>
        <Modal
          isOpen={isOpen}
          onClose={closeModal}
          className="w-full max-w-[600px] p-6 lg:p-10"
        >
          <h4 className="font-semibold text-gray-800 mb-1 text-title-sm dark:text-white/90">
            Modal Heading
          </h4>
          <p className="mb-7 text-sm leading-6 text-gray-500 dark:text-gray-400">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            Pellentesque euismod est quis mauris lacinia pharetra. Sed a ligula
            ac odio condimentum aliquet a nec nulla. Aliquam bibendum ex sit
            amet ipsum rutrum feugiat ultrices enim quam.
          </p>
          <p className="text-sm leading-6 text-gray-500 dark:text-gray-400">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            Pellentesque euismod est quis mauris lacinia pharetra. Sed a ligula
            ac odio.
          </p>
          <div className="flex flex-col-reverse sm:flex-row items-center justify-end w-full gap-3 mt-8">
            <Button size="sm" variant="outline" onClick={closeModal} className="w-full sm:w-auto">
              Close
            </Button>
            <Button size="sm" onClick={handleSave} className="w-full sm:w-auto">
              Save Changes
            </Button>
          </div>
        </Modal>
      </ComponentCard>
    </div>
  );
}
