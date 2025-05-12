import React from "react";
import { FaTimes, FaFileUpload, FaCheckCircle, FaExclamationTriangle, FaCheckDouble } from "react-icons/fa";
import PrimaryBtn from "./PrimaryBtn";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

const SellerForm = ({
  IsModalOpenForSeller,
  handleCloseModalForSeller,
  handleSaveDoc,
  setDocFile,
  isUploading,
  userSellerStatus
}) => {
  const [fileName, setFileName] = React.useState("");
  const [dragActive, setDragActive] = React.useState(false);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setDocFile(file);
      setFileName(file.name);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setDocFile(file);
      setFileName(file.name);
    }
  };

  const clearFile = () => {
    setDocFile(null);
    setFileName("");
  };

  const renderContent = () => {
    switch (userSellerStatus) {
      case "applied":
        return (
          <div className="px-6 py-8 flex flex-col items-center gap-6 text-center">
            <div className="text-yellow-500 mb-2">
              <FaCheckCircle size={60} />
            </div>
            <h3 className="text-xl font-semibold text-gray-800">Application Under Review</h3>
            <p className="text-gray-600 max-w-md">
              Your seller application has been submitted and is currently being reviewed by our team.
              This process typically takes 1-3 business days.
            </p>
            <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4 w-full">
              <p className="text-sm text-yellow-700">
                We'll notify you via email once your application has been processed.
              </p>
            </div>
          </div>
        );

      case "approved":
        return (
          <div className="px-6 py-8 flex flex-col items-center gap-6 text-center">
            <div className="text-green-500 mb-2">
              <FaCheckDouble size={60} />
            </div>
            <h3 className="text-xl font-semibold text-gray-800">You're an Approved Seller!</h3>
            <p className="text-gray-600 max-w-md">
              Congratulations! Your seller account has been approved. You can now list books for sale
              and manage your seller dashboard.
            </p>
            <div className="bg-green-50 border border-green-100 rounded-lg p-4 w-full">
              <p className="text-sm text-green-700">
                Thank you for being a part of our marketplace community.
              </p>
            </div>
          </div>
        );

      case "rejected":
        return (
          <div className="px-6 py-4 flex flex-col gap-5">
            <div className="flex flex-col items-center text-center mb-4">
              <div className="text-red-500 mb-2">
                <FaExclamationTriangle size={48} />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Application Rejected</h3>
              <p className="text-gray-600 max-w-md mb-4">
                Unfortunately, your previous application was not approved. You can submit a new application
                with updated documents.
              </p>
            </div>

            <p className="text-gray-600 text-base sm:text-lg">
              Please upload a valid ID document or business license to verify your seller account.
            </p>

            <div
              className={`relative border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center min-h-[200px] cursor-pointer transition-all duration-200 ${
                dragActive
                  ? "border-primary bg-primary/5"
                  : "border-gray-300 hover:border-gray-400"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                type="file"
                accept=".jpg,.jpeg,.png"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />

              <div className="flex flex-col items-center justify-center text-center">
                {fileName ? (
                  <div className="flex flex-col items-center">
                    <div className="text-green-500 mb-2">
                      <FaCheckCircle size={40} />
                    </div>
                    <p className="font-medium text-lg break-all max-w-full">
                      {fileName}
                    </p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        clearFile();
                      }}
                      className="mt-3 bg-red-100 text-red-600 px-4 py-2 rounded-md flex items-center gap-1 text-sm hover:bg-red-200 transition-colors"
                    >
                      <FaTimes size={12} />
                      Remove
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="text-primary mb-4">
                      <FaFileUpload size={48} />
                    </div>
                    <p className="font-medium text-gray-700 mb-2">
                      Drag & drop your document here
                    </p>
                    <p className="text-gray-500 text-sm mb-4">
                      or click to browse
                    </p>
                    <p className="text-xs text-gray-400">
                      Accepted formats: JPG, JPEG, PNG
                    </p>
                  </>
                )}
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mt-2">
              <p className="text-sm text-blue-700">
                <strong>Note:</strong> Your document will be reviewed by our team.
                This process typically takes 1-3 business days.
              </p>
            </div>
          </div>
        );

      case "no":
      default:
        return (
          <div className="px-6 py-4 flex flex-col gap-5">
            <p className="text-gray-600 text-base sm:text-lg">
              Please upload a valid ID document or business license to verify your seller account.
            </p>

            <div
              className={`relative border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center min-h-[200px] cursor-pointer transition-all duration-200 ${
                dragActive
                  ? "border-primary bg-primary/5"
                  : "border-gray-300 hover:border-gray-400"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                type="file"
                accept=".jpg,.jpeg,.png"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />

              <div className="flex flex-col items-center justify-center text-center">
                {fileName ? (
                  <div className="flex flex-col items-center">
                    <div className="text-green-500 mb-2">
                      <FaCheckCircle size={40} />
                    </div>
                    <p className="font-medium text-lg break-all max-w-full">
                      {fileName}
                    </p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        clearFile();
                      }}
                      className="mt-3 bg-red-100 text-red-600 px-4 py-2 rounded-md flex items-center gap-1 text-sm hover:bg-red-200 transition-colors"
                    >
                      <FaTimes size={12} />
                      Remove
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="text-primary mb-4">
                      <FaFileUpload size={48} />
                    </div>
                    <p className="font-medium text-gray-700 mb-2">
                      Drag & drop your document here
                    </p>
                    <p className="text-gray-500 text-sm mb-4">
                      or click to browse
                    </p>
                    <p className="text-xs text-gray-400">
                      Accepted formats: JPG, JPEG, PNG
                    </p>
                  </>
                )}
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mt-2">
              <p className="text-sm text-blue-700">
                <strong>Note:</strong> Your document will be reviewed by our team.
                This process typically takes 1-3 business days.
              </p>
            </div>
          </div>
        );
    }
  };

  const renderFooter = () => {
    switch (userSellerStatus) {
      case "applied":
        return (
          <PrimaryBtn
            name="Close"
            style="w-auto max-w-none"
            onClick={handleCloseModalForSeller}
          />
        );
      case "approved":
        return (
          <PrimaryBtn
            name="Close"
            style="w-auto max-w-none"
            onClick={handleCloseModalForSeller}
          />
        );
      case "rejected":
      case "no":
      default:
        return (
          <div className="flex justify-end gap-4 w-full">
            <button
              onClick={handleCloseModalForSeller}
              className="text-base sm:text-lg bg-gray-200 text-gray-800 px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>

            <PrimaryBtn
              name={isUploading ? "Submitting..." : "Submit Application"}
              style="w-auto max-w-none"
              onClick={handleSaveDoc}
              disabled={!fileName || isUploading}
            />
          </div>
        );
    }
  };

  const getDialogTitle = () => {
    switch (userSellerStatus) {
      case "applied":
        return "Application Status";
      case "approved":
        return "Seller Status";
      case "rejected":
        return "Re-apply as Seller";
      case "no":
      default:
        return "Become a Seller";
    }
  };

  return (
    <Dialog
      open={IsModalOpenForSeller}
      onOpenChange={handleCloseModalForSeller}
    >
      <DialogContent className="sm:max-w-lg w-[95%] max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-xl p-0">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="text-2xl sm:text-3xl font-semibold text-gray-900 flex justify-between items-center">
            {getDialogTitle()}
          </DialogTitle>
        </DialogHeader>

        {renderContent()}

        <DialogFooter className="px-6 py-4 bg-gray-50 rounded-b-xl border-t border-gray-100">
          {renderFooter()}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SellerForm;
