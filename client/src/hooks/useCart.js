import { isInCartApi } from "@/api/cart";
import { toast } from "sonner";

export async function useIsInCart(id) {
  try {
    const res = await isInCartApi(id);
    console.log(res.data.inCart)
    return res.data.inCart;
  } catch (error) {
    // toast.error(getErrorMessage(error));
  }
}
