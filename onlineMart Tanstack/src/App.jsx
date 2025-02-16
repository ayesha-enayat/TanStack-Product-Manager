import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";

// Fetch products from API
const fetchProducts = async () => {
  const response = await fetch("https://dummyjson.com/products");
  if (!response.ok) throw new Error("Failed to fetch products");
  const data = await response.json();
  return data.products;
};

const Products = () => {
  const queryClient = useQueryClient();
  const [editingProduct, setEditingProduct] = useState(null);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newImage, setNewImage] = useState("");
  const [productTitle, setProductTitle] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [productImage, setProductImage] = useState("");

  // Add Product Mutation (Local Simulation)
  const addProductMutation = useMutation({
    mutationFn: (newProduct) => Promise.resolve(newProduct),
    onMutate: async (newProduct) => {
      queryClient.setQueryData(["products"], (oldProducts) => [
        ...oldProducts,
        { ...newProduct, id: oldProducts.length + 101, images: [newProduct.image] },
      ]);
      Swal.fire("Product Added!", "Your new product has been added successfully.", "success");
    },
  });

  // Update Product Mutation
  const updateProductMutation = useMutation({
    mutationFn: ({ id, title, description, image }) =>
      Promise.resolve({ id, title, description, image }),
    onMutate: async ({ id, title, description, image }) => {
      queryClient.setQueryData(["products"], (oldProducts) =>
        oldProducts.map((product) =>
          product.id === id ? { ...product, title, description, images: [image] } : product
        )
      );
      setEditingProduct(null);
      Swal.fire("Updated!", "The product has been updated successfully.", "success");
    },
  });

  // Delete Product Mutation
  const deleteProductMutation = useMutation({
    mutationFn: (id) => Promise.resolve(id),
    onMutate: async (id) => {
      queryClient.setQueryData(["products"], (oldProducts) =>
        oldProducts.filter((product) => product.id !== id)
      );
      Swal.fire("Deleted!", "The product has been deleted.", "success");
    },
  });

  // Fetch products
  const { data: products = [], isLoading, isError } = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
  });

  if (isLoading) return <div className="text-center text-xl">Loading products...</div>;
  if (isError) return <div className="text-center text-xl text-red-500">Error fetching products</div>;

  return (
    <>
      <div className="text-center text-4xl mt-4 font-bold text-gray-800">Product Manager</div>

      {/* Add Product Section */}
      <div className="p-5 mt-5 bg-gray-100 shadow-md rounded-lg max-w-2xl mx-auto">
        <input
          type="text"
          placeholder="Enter Product Name"
          value={productTitle}
          onChange={(e) => setProductTitle(e.target.value)}
          className="border p-2 rounded w-full mb-2 focus:ring-2 focus:ring-blue-400"
        />
        <textarea
          placeholder="Enter Product Description"
          value={productDescription}
          onChange={(e) => setProductDescription(e.target.value)}
          className="border p-2 rounded w-full mb-2 focus:ring-2 focus:ring-blue-400"
          rows="3"
        />
        <input
          type="text"
          placeholder="Enter Product Image URL"
          value={productImage}
          onChange={(e) => setProductImage(e.target.value)}
          className="border p-2 rounded w-full mb-2 focus:ring-2 focus:ring-blue-400"
        />
        <button
          onClick={() => {
            if (!productTitle.trim() || !productDescription.trim() || !productImage.trim()) {
              Swal.fire("Error!", "All fields are required.", "error");
              return; // Stop execution if fields are empty
            }

            addProductMutation.mutate({
              title: productTitle,
              description: productDescription,
              image: productImage,
            });

            // **Clear the input fields after adding a product**
            setProductTitle("");
            setProductDescription("");
            setProductImage("");

            Swal.fire("Product Added!", "Your new product has been added successfully.", "success");
          }}
          className="rounded-lg px-4 py-2 bg-blue-600 hover:bg-blue-700 transition text-white text-xl w-full"
        >
          Add Product
        </button>


      </div>

      {/* Display Products */}
      <div className="mt-5 max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-gray-800">All Products</h2>
        {products.map(({ title, id, description, images }) => (
          <div
            className="bg-white shadow-lg p-4 m-2 border rounded-lg transition hover:shadow-xl"
            key={id}
          >
            <div className="font-bold text-xl text-blue-700">Product #{id}</div>

            {editingProduct === id ? (
              <>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="border p-2 rounded w-full mb-2 focus:ring-2 focus:ring-blue-400"
                />
                <textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="border p-2 rounded w-full focus:ring-2 focus:ring-blue-400"
                  rows="3"
                />
                <input
                  type="text"
                  value={newImage}
                  onChange={(e) => setNewImage(e.target.value)}
                  className="border p-2 rounded w-full mb-2 focus:ring-2 focus:ring-blue-400"
                  placeholder="Enter New Image URL"
                />
              </>
            ) : (
              <>
                <h1 className="text-lg font-semibold text-gray-800">Name: {title}</h1>
                <p className="text-gray-600">{description}</p>
                <img
                  src={images?.[0] || "https://via.placeholder.com/200"}
                  alt={title}
                  className="w-40 h-40 object-cover rounded-lg mt-2 mx-auto"
                />

              </>
            )}

            <div className="mt-3 flex gap-2">
              {editingProduct === id ? (
                <button
                  onClick={() =>
                    updateProductMutation.mutate({
                      id,
                      title: newTitle,
                      description: newDescription,
                      image: newImage,
                    })
                  }
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition"
                >
                  Save
                </button>
              ) : (
                <button
                  onClick={() => {
                    setEditingProduct(id);
                    setNewTitle(title);
                    setNewDescription(description);
                    setNewImage(images?.[0] || "");
                  }}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition"
                >
                  Edit
                </button>
              )}
              <button
                onClick={() => deleteProductMutation.mutate(id)}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default Products;
