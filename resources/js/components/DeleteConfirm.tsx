import { useState } from "react";
import Swal from "sweetalert2";
import { router } from "@inertiajs/react";
import { Trash2, Loader2 } from "lucide-react";

interface DeleteConfirmProps {
  id: number;
  url: string;
  onSuccess?: () => void;
  children?: React.ReactNode;   // <-- FIX ADDED
}

export default function DeleteConfirm({
  id,
  url,
  onSuccess,
  children,
}: DeleteConfirmProps) {
  const [loading, setLoading] = useState(false);

  const handleDelete = () => {
    Swal.fire({
      title: "Are you sure?",
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        setLoading(true);
        router.delete(url, {
          preserveScroll: true,
          onSuccess: () => {
            Swal.fire("Deleted!", "Record has been deleted.", "success");
            setLoading(false);
            if (onSuccess) onSuccess();
          },
          onError: () => {
            Swal.fire("Error!", "Something went wrong.", "error");
            setLoading(false);
          },
        });
      }
    });
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className={`p-2 rounded text-white flex items-center justify-center ${loading
          ? "bg-gray-400 cursor-not-allowed"
          : "bg-red-500 hover:bg-red-600"
        }`}
    >
      {loading ? (
        <Loader2 size={16} className="animate-spin" />
      ) : children ? (
        children
      ) : (
        <Trash2 size={16} />
      )}
    </button>
  );
}
