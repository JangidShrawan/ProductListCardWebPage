// Fetch the data and render products
fetch("data.json")
  .then((response) => response.json())
  .then((items) => {
    const container = document.querySelector(".product-list");
    items.forEach((item) => {
      const itemDiv = document.createElement("div");
      itemDiv.classList.add("item");
      const randomId = generateRandomId();
      itemDiv.innerHTML = `
        <div class='image-container'>
        <img src='${
          item.image.desktop
        }' alt='' class='item-image' loading='lazy'>
        </div>
        <button class='add-to-cart' data-id='${randomId}' data-count='0'>
          <div class='add'>
            <img src='assets/images/icon-add-to-cart.svg' alt='cart icon'>
            <span>Add to cart</span>
          </div>
        </button>
        <p class='item-category'>${item.category}</p>
        <h4 class='item-name'>${item.name}</h4>
        <p class='item-price'>&dollar; <span>${item.price.toFixed(2)}</span></p>
      `;
      container.appendChild(itemDiv);
    });

    // Event delegation - Listen for button clicks on the parent container
    container.addEventListener("click", (e) => {
      const button = e.target.closest(".add-to-cart");
      if (button) {
        handleCartButtonClick(button);
      }

      const negBtn = e.target.closest(".neg-btn");
      if (negBtn) {
        handleNegButtonClick(negBtn);
      }

      const posBtn = e.target.closest(".pos-btn");
      if (posBtn) {
        handlePosButtonClick(posBtn);
      }
    });
  })
  .catch((error) => console.error("Error fetching products:", error));

// Generate random ID for product items
function generateRandomId() {
  return "_" + Math.random().toString(36).substr(2, 9);
}

const selectedItemsList = document.querySelector(".selected-items");
const selectedQuantity = document.querySelector(".selected-q");
let total_quantity = 0;
let orderTotal = 0;

// Handle add-to-cart button click
function handleCartButtonClick(button) {
  let count = parseInt(button.getAttribute("data-count"));

  if (button.querySelector(".add")) {
    count++;
    total_quantity++;
    selectedQuantity.textContent = total_quantity;
    button.setAttribute("data-count", count);
    button.innerHTML = `
      <button class='neg-btn'>-</button>
      <span class='counter'>${count}</span>
      <button class='pos-btn'>+</button>
    `;
    button.classList.add("updated-add-to-cart");

    // Get the product details
    const productId = button.getAttribute("data-id");
    const productName =
      button.parentNode.querySelector(".item-name").textContent;
    const price = parseFloat(
      button.parentNode.querySelector(".item-price span").textContent
    );

    // Add item to the selected list
    addItemToSelectedList(productId, productName, price, count);

    // Add class to the corresponding image
    const image = button.parentNode.querySelector(".item-image");
    image.classList.add("updated-img-state");
  }
}

// Handle decrement button click
function handleNegButtonClick(negBtn) {
  const button = negBtn.closest(".add-to-cart");
  let count = parseInt(button.getAttribute("data-count"));

  if (count > 1) {
    count--;
    button.setAttribute("data-count", count);
    button.querySelector(".counter").textContent = count;
    updateSelectedList(button.getAttribute("data-id"), count);
  } else if (count === 1) {
    // Reset to "Add to cart" state
    button.setAttribute("data-count", 0);
    button.classList.remove("updated-add-to-cart");
    button.innerHTML = `
      <div class='add'>
        <img src='assets/images/icon-add-to-cart.svg' alt='cart icon'>
        <span>Add to cart</span>
      </div>
    `;
    // Remove from the selected list
    updateSelectedList(button.getAttribute("data-id"), 0);

    // Remove the class from the corresponding image
    const image = button.parentNode.querySelector(".item-image");
    image.classList.remove("updated-img-state");
  }

  total_quantity--;
  selectedQuantity.textContent = total_quantity;

  // Recalculate order total
  recalculateOrderTotal();
}

// Handle increment button click
function handlePosButtonClick(posBtn) {
  const button = posBtn.closest(".add-to-cart");
  let count = parseInt(button.getAttribute("data-count"));

  count++;
  button.setAttribute("data-count", count);
  button.querySelector(".counter").textContent = count;
  updateSelectedList(button.getAttribute("data-id"), count);
  total_quantity++;
  selectedQuantity.textContent = total_quantity;

  // Recalculate order total
  recalculateOrderTotal();
}

// Add item to the selected list card
function addItemToSelectedList(productId, productName, price, count) {
  if (selectedItemsList.querySelectorAll("li").length === 0) {
    selectedItemsList.innerHTML = "";
    selectedItemsList.classList.add("updated-selectList");

    const orderTotalDiv = document.createElement("div");
    orderTotalDiv.className = "order-total";
    orderTotalDiv.innerHTML = `
      <span class='order-total-text'>Order Total</span>
      <span class='order-total-money'>&dollar;<span class='order-total-dollar'>0.00</span></span>
    `;
    selectedItemsList.parentElement.appendChild(orderTotalDiv);

    const desMessage = document.createElement("p");
    desMessage.innerHTML = `
      <img src='assets/images/icon-carbon-neutral.svg' alt='carbon-neutral icon' class='des-message-icon'>
      <span class='des-message-text'>This is a <strong>carbon-neutral</strong> delivery</span>
    `;
    desMessage.className = "des-message";
    selectedItemsList.parentElement.appendChild(desMessage);

    const confirmationBtn = document.createElement("button");
    confirmationBtn.textContent = "Confirm Order";
    confirmationBtn.id = "confirm-btn";
    confirmationBtn.className = "confirm-btn";
    selectedItemsList.parentElement.appendChild(confirmationBtn);

    confirmationBtn.addEventListener("click", (event) => {
      const message = "Are you sure you want to confirm this order?";
      showCustomConfirm(message, (userConfirmed) => {
        if (userConfirmed) {
          // Query all the list items inside selectedItemsList
          const listItems = selectedItemsList.querySelectorAll("li");
          const confirmSelectedListItems = document.querySelector('.confirm-selected-items');
          let allTotalDollar = 0;
          listItems.forEach((item) => {
            const itemName = item.querySelector(".list-item-name").textContent;
            const itemPrice = parseFloat(item.querySelector('.single-price').textContent.replace('$', ''));
            const qnty = parseInt(item.querySelector('.qnty').textContent.replace('x', ''));
            const itemTotal = itemPrice * qnty;
            allTotalDollar += itemTotal;
            const itemId = item.getAttribute('data-id');
            const itemImage = document.querySelector(`.item button[data-id="${itemId}"]`).parentElement.querySelector('.image-container img').src;

            let selectedItem = document.createElement('li');
            selectedItem.className = 'confirm-selected-list-item';
            selectedItem.innerHTML = `
              <div>
              <img src='${itemImage}' alt='item image' loading='lazy'>
              <div class='confirm-name-and-price'>
              <span class='list-item-name'>${itemName}</span>
              <p class='qnty-and-price'><span class='qnty'>${qnty}x</span><span class='single-price'><span>$</span>${itemPrice.toFixed(2)}</span></p>
              </div>
              </div>
              <div class='item-total-price'><span>$</span>${itemTotal.toFixed(2)}</div>
            `;
            confirmSelectedListItems.appendChild(selectedItem);
          });
          const totalMoneyInDollar = document.querySelector('.order-total-dollar-t');
          totalMoneyInDollar.textContent = allTotalDollar.toFixed(2);
          
          let ourModal = document.getElementById("order-confirm-modal");
          const startNewButton = document.getElementById('startNew');

          ourModal.style.display = 'block';

          startNewButton.onclick = () => {
            ourModal.style.display = 'none';
            location.reload();
          }
        }
      });
    });
  }

  let listItem = document.querySelector(`li[data-id="${productId}"]`);
  if (!listItem) {
    listItem = document.createElement("li");
    listItem.setAttribute("data-id", productId);

    const totalPrice = count * price;

    listItem.innerHTML = `
      <div class='item-name-and-price'>
        <span class='list-item-name'>${productName}</span>
        <p class='qnty-and-price'><span class='qnty'>${count}x</span><span class='single-price'><span>$</span>${price.toFixed(
      2
    )}</span><span class='item-total-price'><span>$</span>${totalPrice.toFixed(
      2
    )}</span></p>
      </div>
      <button class='list-item-remover'>x</button>
    `;
    listItem.classList.add("list-item");
    selectedItemsList.appendChild(listItem);
  }

  // Recalculate order total
  recalculateOrderTotal();
}

// Update the selected list with new count
function updateSelectedList(productId, count) {
  const listItem = document.querySelector(`li[data-id="${productId}"]`);
  if (listItem) {
    const price = parseFloat(
      listItem.querySelector(".single-price").textContent.replace("$", "")
    );
    const totalPrice = count * price;

    if (count > 0) {
      listItem.querySelector(".qnty").textContent = `${count}x`;
      listItem.querySelector(
        ".item-total-price"
      ).innerHTML = `<span>$</span>${totalPrice.toFixed(2)}`;
    } else {
      listItem.remove();
    }

    // Recalculate order total
    recalculateOrderTotal();
  }
}

// Add event listener to remove an item from the list
document.addEventListener("click", (event) => {
  if (event.target.classList.contains("list-item-remover")) {
    const listItem = event.target.closest("li");
    const productId = listItem.getAttribute("data-id");
    let message = "Are you sure you want to remove this list item?";
    showCustomConfirm(message, (userConfirmed) => {
      if (userConfirmed) {
        removeItemFromSelectedList(productId); // Remove item if user confirms
        recalculateOrderTotal(); // Recalculate totals
      }
    });
  }
});

// Function to remove item from selected list
function removeItemFromSelectedList(productId) {
  const listItem = document.querySelector(`li[data-id="${productId}"]`);

  if (listItem) {
    const quantity = parseInt(listItem.querySelector(".qnty").textContent);
    total_quantity -= quantity;
    selectedQuantity.textContent = total_quantity;

    // Remove the list item
    listItem.remove();

    // Revert the button back to "Add to cart" for the removed item
    const button = document.querySelector(
      `.add-to-cart[data-id="${productId}"]`
    );
    button.setAttribute("data-count", 0);
    button.classList.remove("updated-add-to-cart");
    button.innerHTML = `
      <div class='add'>
        <img src='assets/images/icon-add-to-cart.svg' alt='cart icon'>
        <span>Add to cart</span>
      </div>
    `;

    // Remove the class from the corresponding image
    const image = button.parentNode.querySelector(".item-image");
    image.classList.remove("updated-img-state");
  }

  // If the list is empty, reset the UI
  if (selectedItemsList.querySelectorAll("li").length === 0) {
    selectedItemsList.innerHTML = `<img src="assets/images/illustration-empty-cart.svg" alt="empty illustration image">
        <p>Your added items will appear here</p>`;
    document.querySelector(".order-total").remove();
    document.querySelector(".des-message").remove();
    document.querySelector(".confirm-btn").remove();
  }
}

// Recalculate the order total and update the UI
function recalculateOrderTotal() {
  const listItems = selectedItemsList.querySelectorAll("li");
  let newTotal = 0;

  listItems.forEach((listItem) => {
    const itemTotalPrice = parseFloat(
      listItem.querySelector(".item-total-price").textContent.replace("$", "")
    );
    newTotal += itemTotalPrice;
  });

  // Update the total price in the order summary
  const orderTotalDollarElement = document.querySelector(".order-total-dollar");
  if (orderTotalDollarElement) {
    orderTotalDollarElement.textContent = newTotal.toFixed(2);
  }
}

// Function to show the custom confirmation modal
function showCustomConfirm(message, callback) {
  const modal = document.getElementById("confirm-modal");
  const yesBtn = document.getElementById("confirm-yes");
  const noBtn = document.getElementById("confirm-no");
  let modalMessage = document.getElementById("confirm-message");
  modalMessage.textContent = message;
  // Display the modal
  modal.style.display = "block";

  // Handle the "Yes" button click
  yesBtn.onclick = () => {
    callback(true); // Proceed with removal
    modal.style.display = "none"; // Hide modal
  };

  // Handle the "No" button click
  noBtn.onclick = () => {
    callback(false); // Do nothing
    modal.style.display = "none"; // Hide modal
  };
}
