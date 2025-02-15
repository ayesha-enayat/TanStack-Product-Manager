import { useState, useEffect } from "react";
import Swal from "sweetalert2"; // Import SweetAlert2

const getAllProductsFromAPI = async () => {
  try {
    const response = await fetch("https://dummyjson.com/products");
    if (!response.ok) {
      throw new Error("Failed to fetch products");
    }
    const data = await response.json();
    return data.products;
  } catch (error) {
    console.error(error);
    return [];
  }
};

const Products = () => {
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [productTitle, setProductTitle] = useState("");
  const [productDescription, setProductDescription] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      const data = await getAllProductsFromAPI();
      setProducts(data);
    };
    fetchProducts();
  }, []);

  const handleDelete = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to undo this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        setProducts(products.filter((product) => product.id !== id));
        Swal.fire("Deleted!", "The product has been deleted.", "success");
      }
    });
  };

  const handleEdit = (id, currentTitle, currentDescription) => {
    setEditingProduct(id);
    setNewTitle(currentTitle);
    setNewDescription(currentDescription);
  };

  const handleUpdate = (id) => {
    const updatedProducts = products.map((product) =>
      product.id === id ? { ...product, title: newTitle, description: newDescription } : product
    );
    setProducts(updatedProducts);
    setEditingProduct(null);
    Swal.fire("Updated!", "The product has been updated successfully.", "success");
  };

  const handleCreateProduct = () => {
    if (!productTitle || !productDescription) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Title and Description are required!",
      });
      return;
    }

    const newProduct = {
      id: products.length + 101, // Unique ID for new products
      title: productTitle,
      description: productDescription,
    };

    setProducts([...products, newProduct]);
    setProductTitle("");
    setProductDescription("");

    Swal.fire({
      icon: "success",
      title: "Product Added!",
      text: "Your new product has been added successfully.",
    });
  };

  return (
    <>
      <div className="text-center text-4xl mt-4 font-bold text-gray-800">Product Manager</div>

      {/* Create Product Section */}
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
        <button
          onClick={handleCreateProduct}
          className="rounded-lg px-4 py-2 bg-blue-600 hover:bg-blue-700 transition text-white text-xl w-full"
        >
          Add Product
        </button>
      </div>

      {/* Display Products */}
      <div className="mt-5 max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-gray-800">All Products</h2>
        {products.map(({ title, id, description }) => (
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
              </>
            ) : (
              <>
                <h1 className="text-lg font-semibold text-gray-800">Name: {title}</h1>
                <p className="text-gray-600">{description}</p>
              </>
            )}

            <div className="mt-3 flex gap-2">
              {editingProduct === id ? (
                <button
                  onClick={() => handleUpdate(id)}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition"
                >
                  Save
                </button>
              ) : (
                <button
                  onClick={() => handleEdit(id, title, description)}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition"
                >
                  Edit
                </button>
              )}
              <button
                onClick={() => handleDelete(id)}
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
