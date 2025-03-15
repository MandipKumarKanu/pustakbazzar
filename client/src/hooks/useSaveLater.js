import { isSavedApi } from "@/api/saveForLater";
import getErrorMessage from "@/utils/getErrorMsg";
import { toast } from "sonner";

export async function useIsSaved(id) {
  try {
    const res = await isSavedApi(id);
    return res.data.isSaved;
  } catch (error) {
    // toast.error(getErrorMessage(error));
  }
}
