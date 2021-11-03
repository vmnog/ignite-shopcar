import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { toast } from "react-toastify";
import { api } from "../services/api";
import { Product, Stock } from "../types";

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem("@RocketShoes:cart");

    if (storagedCart) {
      return JSON.parse(storagedCart);
    }

    return [];
  });

  const addProduct = async (productId: number) => {
    try {
      const { data } = await api.get<Product[]>("products");

      const product = data.find((p) => p.id === productId);

      if (!product) throw new Error("Erro ao adicionar o produto");

      const productExists = cart.find((p) => p.id === productId);

      if (!!productExists) {
        const newCart = cart.map((p) =>
          p.id === productId ? { ...p, amount: p.amount + 1 } : p
        );

        return setCart(newCart);
      }

      setCart([...cart, { ...product, amount: 1 }]);
    } catch {
      toast.error("Erro ao adicionar o produto");
    }
  };

  const removeProduct = (productId: number) => {
    try {
      const product = cart.find((p) => p.id === productId);

      if (!product) throw new Error("Erro na remoção do produto");

      setCart(cart.filter((p) => p.id !== productId));
    } catch {
      toast.error("Erro na remoção do produto");
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      const productExists = cart.find((p) => p.id === productId);

      if (!productExists)
        throw new Error("Erro na alteração de quantidade do produto");

      const newCart = cart.map((p) =>
        p.id === productId ? { ...p, amount } : p
      );

      setCart(newCart);
    } catch {
      toast.error("Erro na alteração de quantidade do produto");
    }
  };

  useEffect(() => {
    localStorage.setItem("@RocketShoes:cart", JSON.stringify(cart));
  }, [cart]);

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
