import ComponentCard from "../../common/ComponentCard";
import Button from "../../ui/button/Button";
import { Modal } from "../../ui/modal";
import { useModal } from "../../../hooks/useModal";
import Label from "../../form/Label";
import Input from "../../form/input/InputField";

export default function FormInModal() {
  const { isOpen, openModal, closeModal } = useModal();
  const handleSave = () => {
    // Handle save logic here
    console.log("Saving changes...");
    closeModal();
  };
  return (
    <ComponentCard title="Form In Modal">
      <Button size="sm" onClick={openModal}>
        Open Modal
      </Button>
      <Modal
        isOpen={isOpen}
        onClose={closeModal}
        className="w-full max-w-[600px] p-6 lg:p-10"
      >
        <form className="">
          <h4 className="mb-1 text-title-sm font-semibold text-gray-800 dark:text-white/90">
            Personal Information
          </h4>
          <p className="mb-7 text-sm leading-6 text-gray-500 dark:text-gray-400">
            Update your personal details below.
          </p>

          <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
            <div className="col-span-1">
              <Label>First Name</Label>
              <Input type="text" placeholder="Emirhan" />
            </div>

            <div className="col-span-1">
              <Label>Last Name</Label>
              <Input type="text" placeholder="Boruch" />
            </div>

            <div className="col-span-1">
              <Label>Last Name</Label>
              <Input type="email" placeholder="emirhanboruch55@gmail.com" />
            </div>

            <div className="col-span-1">
              <Label>Phone</Label>
              <Input type="text" placeholder="+09 363 398 46" />
            </div>

            <div className="col-span-1 sm:col-span-2">
              <Label>Bio</Label>
              <Input type="text" placeholder="Team Manager" />
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row items-center justify-end w-full gap-3 mt-8">
            <Button size="sm" variant="outline" onClick={closeModal} className="w-full sm:w-auto">
              Close
            </Button>
            <Button size="sm" onClick={handleSave} className="w-full sm:w-auto">
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>
    </ComponentCard>
  );
}
