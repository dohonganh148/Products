let productList = [];

const fetchProduct = async () => {
  // 1. Call API fetch product list
  try {
    const res = await axios({
      url: "https://6350d1293e9fa1244e4dd61b.mockapi.io/Products",
      method: "GET",
    });
    productList = mapData(res.data);
    renderProducts(productList);
  } catch (err) {
    console.log(err);
  }
};
// 3. Hiển thị danh sách sản phẩm ra màn hình
const renderProducts = (data) => {
  let productHTML = "";
  productHTML = data
    .map(
      (product) => `
    <div class="card">
        <div class="top-bar">
        <p class="top-type">${product.type}</p>
        <p class="top-status">In Stock</p>
        </div>
        <div class="img-container">
        <img src="${product.img}" />
        </div>
        <div class="details">
        <div class="name-fav">
            <p>${product.name}</p>
            <button>
            <i class="fa fa-heart"></i>
            </button>
        </div>
        <div class="content">
            <p>Screen: ${product.screen}</p>
            <p>Back Camera: ${product.backCamera}</p>
            <p>Front Camera: ${product.frontCamera}</p>
            <p>${product.desc}</p>
        </div>
        <div class="purchase">
          <p class="product-price">$ ${product.price}</p>
          <span class="btnAddProduct" >
          ${renderPurchase(product)}
          </div>
          </span>
        </div>
    </div>
    `
    )
    .join("");
  document.getElementById("productList").innerHTML = productHTML;
  document.getElementById("totalQuantify").innerHTML = getCartQuantity();
  refreshCart();
};

const renderPurchase = (product) => {
  const amount = getProductQuantity(product.id);
  if (amount > 0) {
    return `
    <div class="quantity-change" id="quantity-change-${product.id}">
      <button class="btnQty" onclick={minusCart(${product.id})}>
        <i class="fa fa-angle-left"></i>
      </button>
      <p class="qty" id="qty-${product.id}">${amount}</p>
      <button class="btnQty" onclick={addToCart(${product.id})}>
        <i class="fa fa-angle-right"></i>
      </button>
    </div>
    `;
  } else {
    return `
      <button class="btn-Add"  id="add-btn-${product.id}" onclick={addToCart(${product.id})}>
        Add <i class="fa fa-angle-right"></i>
      </button>
    `;
  }
};


const mapData = (dataFromAPI) => {
  const result = [];
  dataFromAPI.forEach((oldProduct) => {
    const {id, name, price, screen, backCamera, frontCamera, img, desc, type} = oldProduct;
    result.push(new Products(id, name, price, screen, backCamera, frontCamera, img, desc, type));
  });
  return result;
};

// 4. Filter theo loại sản phẩm
const filterProduct = () => {
  let typeProduct = document.getElementById("typeProduct").value;
  if (typeProduct === "none") {
    renderProducts(productList);
  } else {
    let result = [];
    productList.forEach((product) => {
      if (product.type.toLowerCase() === typeProduct) {
        result.push(product);
      }
    });
    renderProducts(result);
  }
};

// 5+6. Chọn sản phẩm bỏ vào giỏ hàng
const addToCart = (productId) => {
  let cart = getCart();

  let product = productList.find((item) => item.id == productId);
  let isExist = cart.find((item) => item?.product?.id == productId);
  if (isExist) {
    isExist.quantity += 1;
  } else {
    let cartItem = {
      product: product,
      quantity: 1,
    };
    cart.push(cartItem);
  }
  setCart(cart);

  renderProducts(productList);
};

const minusCart = (productId) => {
  let cart = getCart();
  let cartItem = cart.find((item) => item?.product?.id == productId);
  if (cartItem.quantity > 1) {
    cartItem.quantity -= 1;
    setCart(cart);
  } else {
    removeProduct(productId);
  }

  renderProducts(productList);
};

// Tính totalQuantity ở button Cart
const getCartQuantity = () => {
  const cart = getCart();
  return cart.reduce(
    (prevProduct, currentProduct) => prevProduct + currentProduct.quantity,
    0
  );
};
const getProductQuantity = (productId) => {
  const cart = getCart();
  let quantity = 0;
  let product = cart.find((item) => item?.product?.id == productId);
  quantity = product?.quantity ? product?.quantity : 0;
  return quantity;
};

// Render giỏ hàng ra màn hình
const renderCart = () => {
  document.getElementById("cover").style.display = "block";
  document.getElementById("cart").style.right = 0;
  refreshCart();
};

const refreshCart = () => {
  const cart = getCart();
  let cartHTML = "";
  cartHTML = cart
    .map(
      (cartItem) => `
  <div class="cart-item">
    <div class="cart-img">
        <img src="${cartItem.product.img}" alt="Product">
    </div>
    <p class="cart-name">${cartItem.product.name}</p>
    <div class="quantity-change">
        <button class="btnQty" onclick={minusCart(${cartItem.product.id})}>
            <i class="fa fa-angle-left"></i>
        </button>
        <p class="qty">${cartItem.quantity}</p>
        <button class="btnQty" onclick={addToCart(${cartItem.product.id})}><i class="fa fa-angle-right"></i></button>
    </div>
    <p class="cart-price">$ ${cartItem.product.price}</p>
    <button class="btnDelete" onclick={removeProduct(${cartItem.product.id})}>
      <i class="fa fa-trash"></i>
    </button>
  </div>
  `).join("");
  document.getElementById("cart-group").innerHTML = cartHTML;
  totalPrice();
};

// Close Cart
const closeCart = () => {
  document.getElementById("cover").style.display = "none";
  document.getElementById("cart").style.right = "-100%";
};

// 10. Tính tổng tiền và in ra giao diện
const totalPrice = () => {
  const cart = getCart();
  let totalPrice = 0;
  cart.map((cartItem) => {
    totalPrice += cartItem.product.price * cartItem.quantity;
  });
  document.getElementById("totalPrice").innerHTML = totalPrice;
};

// 11. Lưu giỏ hàng vào localstorage, lần sau khi vào trang sẽ load lên lại.
const setCart = (cart) => {
  var cartJSON = JSON.stringify(cart);
  localStorage.setItem("cart", cartJSON);
};

const getCart = () => {
  const cartJSON = localStorage.getItem("cart");
  if (!cartJSON) return [];
  const cart = JSON.parse(cartJSON);
  return cart;
};

// 12. Ấn nút Purchase, Clear thì sẽ clear giỏ hàng, set mảng giỏ hàng về rỗng
const clearCart = () => {
  setCart([]);
  renderProducts(productList)
};

// 13. Remove sản phẩm ra khỏi giỏ hàng
const removeProduct = (productId) => {
  const cart = getCart();
  let index = findById(productId);
  if (index === -1) {
    alert("Mã sản phảm không có trong giỏ hàng!");
  }
  cart.splice(index, 1);
  setCart(cart);
  renderProducts(productList)
};

const findById = (productId) => {
  const cart = getCart();
  for (let i = 0; i < cart.length; i++) {
    if (cart[i].product.id == productId) {
      return i;
    }
  }
  return -1;
};
// Check quantity cartItem
const checkQuantityCartItem = () => {};

window.onload = () => {
  fetchProduct();
  document.getElementById("typeProduct").addEventListener("change", filterProduct);
  document.getElementById("cart-total").addEventListener("click", renderCart);
  document.getElementById("btnCloseCart").addEventListener("click", closeCart);
  document.getElementById("btnPurchase").addEventListener("click", clearCart);
  document.getElementById("btnClear").addEventListener("click", clearCart);
};
