const slides = Array.from(document.querySelectorAll(".hero-slide"));
const slideNumber = document.querySelector(".slide-count b");
const previousButton = document.querySelector(".slide-prev");
const nextButton = document.querySelector(".slide-next");
let activeSlide = 0;
let slideTimer;

function showSlide(index) {
  activeSlide = (index + slides.length) % slides.length;
  slides.forEach((slide, position) => slide.classList.toggle("is-active", position === activeSlide));
  slideNumber.textContent = String(activeSlide + 1).padStart(2, "0");
}

function restartSlideTimer() {
  window.clearInterval(slideTimer);
  slideTimer = window.setInterval(() => showSlide(activeSlide + 1), 6000);
}

previousButton.addEventListener("click", () => {
  showSlide(activeSlide - 1);
  restartSlideTimer();
});
nextButton.addEventListener("click", () => {
  showSlide(activeSlide + 1);
  restartSlideTimer();
});
restartSlideTimer();

const menuToggle = document.querySelector(".menu-toggle");
const navigation = document.querySelector(".primary-nav");
menuToggle.addEventListener("click", () => {
  const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!isExpanded));
  menuToggle.setAttribute("aria-label", isExpanded ? "Open navigation menu" : "Close navigation menu");
  navigation.classList.toggle("is-open", !isExpanded);
});
navigation.addEventListener("click", (event) => {
  if (event.target.closest("a")) {
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation menu");
    navigation.classList.remove("is-open");
  }
});

const revealElements = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealElements.forEach((element) => revealObserver.observe(element));
} else {
  revealElements.forEach((element) => element.classList.add("is-visible"));
}

document.querySelector("#year").textContent = new Date().getFullYear();

const menuGrid = document.querySelector("#menu-grid");
const menuFilterButtons = Array.from(document.querySelectorAll(".menu-filter"));
const experienceFilterButtons = Array.from(document.querySelectorAll(".experience-filter"));
const experienceCards = Array.from(document.querySelectorAll(".experience-card"));
const orderItemSelect = document.querySelector("#order-item");
const requestTypeSelect = document.querySelector("#request-type");
const reservationFields = document.querySelector("#reservation-fields");
const orderFields = document.querySelector("#order-fields");
const menuCards = Array.from(menuGrid.querySelectorAll(".menu-card"));
const orderItemsList = document.querySelector("#order-items-list");
const addOrderItemButton = document.querySelector(".add-order-item");
const orderItemsSummaryField = document.querySelector(".order-summary-field");
const orderItemsSummary = document.querySelector("#order-items-summary");
const cartDialog = document.querySelector("#cart-dialog");
const cartToggle = document.querySelector(".cart-toggle");
const cartItemsContainer = document.querySelector(".cart-items");
const cartEmptyMessage = document.querySelector(".cart-empty");
const cartCount = document.querySelector(".cart-count");
const cartSubtotal = document.querySelector(".cart-subtotal strong");
const cartCheckoutButton = document.querySelector(".cart-checkout");
const cartCancelButton = document.querySelector(".cart-cancel");
const cartCloseButton = document.querySelector(".cart-close");
const orderQuantityInput = document.querySelector("#order-quantity");
const orderMethodSelect = document.querySelector("#order-method");
const deliveryLocationField = document.querySelector(".delivery-location-field");
const deliveryLocationInput = document.querySelector("#delivery-location");
const cartSummaryField = document.querySelector(".cart-summary-field");
const cartSummaryInput = document.querySelector("#order-cart-summary");
const bookingForm = document.querySelector(".booking-form");
const emailFallbackButton = document.querySelector(".email-fallback-button");
const cart = new Map();
let cartCheckoutMode = false;
let nextOrderItemRowId = 2;
const formatPrice = (price) => new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
}).format(Number(price));

function getMenuCard(itemId) {
  return menuCards.find((card) => card.dataset.itemId === itemId);
}

function updateCart() {
  const entries = Array.from(cart.entries())
    .map(([itemId, quantity]) => ({ card: getMenuCard(itemId), quantity }))
    .filter((entry) => entry.card);
  const itemCount = entries.reduce((total, entry) => total + entry.quantity, 0);
  const subtotal = entries.reduce(
    (total, entry) => total + Number(entry.card.dataset.price) * entry.quantity,
    0,
  );

  cartItemsContainer.replaceChildren();
  entries.forEach(({ card, quantity }) => {
    const itemId = card.dataset.itemId;
    const item = document.createElement("article");
    item.className = "cart-item";

    const image = card.querySelector("img");
    const thumbnail = document.createElement("img");
    thumbnail.src = image.src;
    thumbnail.alt = image.alt;
    thumbnail.loading = "lazy";
    item.append(thumbnail);

    const details = document.createElement("div");
    details.className = "cart-item-details";
    const name = document.createElement("h3");
    name.textContent = card.querySelector("h3").textContent.trim();
    const price = document.createElement("p");
    price.textContent = `${formatPrice(card.dataset.price)} each`;
    details.append(name, price);

    const controls = document.createElement("div");
    controls.className = "cart-item-controls";
    const decrease = document.createElement("button");
    decrease.type = "button";
    decrease.dataset.cartAction = "decrease";
    decrease.dataset.itemId = itemId;
    decrease.setAttribute("aria-label", `Remove one ${name.textContent}`);
    decrease.textContent = "−";
    const quantityLabel = document.createElement("span");
    quantityLabel.textContent = String(quantity);
    const increase = document.createElement("button");
    increase.type = "button";
    increase.dataset.cartAction = "increase";
    increase.dataset.itemId = itemId;
    increase.setAttribute("aria-label", `Add one ${name.textContent}`);
    increase.textContent = "+";
    controls.append(decrease, quantityLabel, increase);

    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "cart-item-remove";
    remove.dataset.cartAction = "remove";
    remove.dataset.itemId = itemId;
    remove.textContent = "Remove";
    details.append(controls, remove);

    const lineTotal = document.createElement("strong");
    lineTotal.className = "cart-item-total";
    lineTotal.textContent = formatPrice(Number(card.dataset.price) * quantity);
    item.append(details, lineTotal);
    cartItemsContainer.append(item);
  });

  cartCount.textContent = String(itemCount);
  cartToggle.setAttribute("aria-label", `Open cart, ${itemCount} ${itemCount === 1 ? "item" : "items"}`);
  cartEmptyMessage.hidden = itemCount > 0;
  cartItemsContainer.hidden = itemCount === 0;
  cartSubtotal.textContent = formatPrice(subtotal);
  cartCheckoutButton.disabled = itemCount === 0;
  cartCancelButton.disabled = itemCount === 0;

  const summary = entries.map(({ card, quantity }) => {
    const name = card.querySelector("h3").textContent.trim();
    const price = Number(card.dataset.price);
    return `${name} x${quantity} — ${formatPrice(price * quantity)}`;
  });
  if (summary.length) summary.push(`Subtotal — ${formatPrice(subtotal)}`);
  cartSummaryInput.value = summary.join("\n");
  cartCheckoutButton.setAttribute("aria-label", itemCount ? `Continue with ${itemCount} cart items` : "Your cart is empty");
  if (cartCheckoutMode && itemCount === 0) {
    cartCheckoutMode = false;
    setRequestType(requestTypeSelect.value);
  }
}

function addToCart(itemId) {
  if (!getMenuCard(itemId)) return;
  cart.set(itemId, (cart.get(itemId) || 0) + 1);
  cartEmptyMessage.textContent = "Your cart is waiting for something good.";
  cartCheckoutMode = false;
  setRequestType(requestTypeSelect.value);
  updateCart();
  if (!cartDialog.open) cartDialog.showModal();
}

function filterMenu(category = "all") {
  menuCards.forEach((card) => {
    card.hidden = category !== "all" && card.dataset.category !== category;
  });
}

filterMenu("food");

function populateOrderItems() {
  orderItemSelect.replaceChildren(new Option("Select a menu item", ""));
  menuFilterButtons
    .filter((button) => button.dataset.category !== "all")
    .forEach((button) => {
      const category = button.dataset.category;
      const categoryItems = menuCards.filter((card) => card.dataset.category === category);
      if (!categoryItems.length) return;

      const group = document.createElement("optgroup");
      group.label = button.dataset.categoryLabel || button.textContent.trim();
      categoryItems.forEach((card) => {
        const option = new Option(
          `${card.querySelector("h3").textContent.trim()} — ${formatPrice(card.dataset.price)}`,
          card.dataset.itemId,
        );
        group.append(option);
      });
      orderItemSelect.append(group);
    });
}

function updateManualOrderSummary() {
  const rows = Array.from(orderItemsList.querySelectorAll(".order-item-row"));
  const selectedItems = rows.map((row) => {
    const select = row.querySelector("select");
    const quantityInput = row.querySelector('input[type="number"]');
    const card = getMenuCard(select.value);
    const quantity = Number(quantityInput.value);
    if (!card || !Number.isInteger(quantity) || quantity < 1) return null;

    const lineTotal = Number(card.dataset.price) * quantity;
    return {
      name: card.querySelector("h3").textContent.trim(),
      quantity,
      lineTotal,
    };
  }).filter(Boolean);

  const subtotal = selectedItems.reduce((total, item) => total + item.lineTotal, 0);
  const summary = selectedItems.map((item) =>
    `${item.name} x${item.quantity} — ${formatPrice(item.lineTotal)}`,
  );
  if (summary.length) summary.push(`Subtotal — ${formatPrice(subtotal)}`);
  orderItemsSummary.value = summary.join("\n");
}

function addOrderItemRow() {
  const row = document.createElement("div");
  row.className = "form-grid order-item-row";

  const itemLabel = document.createElement("label");
  itemLabel.className = "form-field form-full";
  const rowId = nextOrderItemRowId++;
  const itemId = `order-item-${rowId}`;
  itemLabel.htmlFor = itemId;
  itemLabel.append(document.createTextNode("Choose an item"));

  const itemSelect = document.createElement("select");
  itemSelect.id = itemId;
  itemSelect.required = true;
  itemSelect.disabled = requestTypeSelect.value !== "Order" || cartCheckoutMode;
  itemSelect.setAttribute("aria-label", "Choose another menu item");
  Array.from(orderItemSelect.children).forEach((optionGroup) => {
    itemSelect.append(optionGroup.cloneNode(true));
  });
  itemLabel.append(itemSelect);

  const quantityLabel = document.createElement("label");
  quantityLabel.className = "form-field";
  const quantityId = `order-quantity-${rowId}`;
  quantityLabel.htmlFor = quantityId;
  quantityLabel.append(document.createTextNode("Quantity"));

  const quantityInput = document.createElement("input");
  quantityInput.id = quantityId;
  quantityInput.type = "number";
  quantityInput.min = "1";
  quantityInput.max = "50";
  quantityInput.value = "1";
  quantityInput.required = true;
  quantityInput.disabled = requestTypeSelect.value !== "Order" || cartCheckoutMode;
  quantityLabel.append(quantityInput);

  row.append(itemLabel, quantityLabel);

  if (orderItemsList.children.length > 0) {
    const removeButton = document.createElement("button");
    removeButton.className = "remove-order-item";
    removeButton.type = "button";
    removeButton.textContent = "Remove item";
    removeButton.setAttribute("aria-label", "Remove this menu item from the order");
    removeButton.addEventListener("click", () => {
      row.remove();
      updateManualOrderSummary();
    });
    row.append(removeButton);
  }

  orderItemsList.append(row);
  addOrderItemButton.disabled = requestTypeSelect.value !== "Order" || cartCheckoutMode;
}

function setRequestType(type) {
  const isOrder = type === "Order";
  reservationFields.hidden = isOrder;
  orderFields.hidden = !isOrder;
  reservationFields.querySelectorAll("input, select").forEach((field) => {
    field.disabled = isOrder;
  });
  orderItemsList.querySelectorAll("select, input").forEach((field) => {
    field.disabled = !isOrder || cartCheckoutMode;
  });
  addOrderItemButton.disabled = !isOrder || cartCheckoutMode;
  orderItemsSummaryField.hidden = !isOrder || cartCheckoutMode;
  orderItemsSummary.disabled = !isOrder || cartCheckoutMode;
  orderItemsSummary.required = isOrder && !cartCheckoutMode;
  orderMethodSelect.disabled = !isOrder;
  updateDeliveryLocationField(isOrder);
  cartSummaryField.hidden = !isOrder || !cartCheckoutMode;
  cartSummaryInput.disabled = !isOrder || !cartCheckoutMode;
  cartSummaryInput.required = isOrder && cartCheckoutMode;
}

function updateDeliveryLocationField(isOrder = requestTypeSelect.value === "Order") {
  const needsDeliveryAddress = isOrder && orderMethodSelect.value === "Delivery";
  deliveryLocationField.hidden = !needsDeliveryAddress;
  deliveryLocationInput.disabled = !needsDeliveryAddress;
  deliveryLocationInput.required = needsDeliveryAddress;
  if (!needsDeliveryAddress) deliveryLocationInput.value = "";
}

function getRequestDetails() {
  const formData = new FormData(bookingForm);
  return Array.from(formData.entries())
    .filter(([, value]) => value)
    .map(([name, value]) => `${name}:\n${value}`)
    .join("\n\n");
}

function openEmailDraft() {
  if (!bookingForm.reportValidity()) return;

  const subject = requestTypeSelect.value === "Order"
    ? "Cloud 7 order request"
    : "Cloud 7 reservation request";
  const mailto = `mailto:ukanah6@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(getRequestDetails())}`;
  window.location.href = mailto;
  document.querySelector(".form-setup-note").textContent =
    "Your email app should open with the request addressed to ukanah6@gmail.com. Press Send in your email app to complete your request.";
}

function openWhatsAppRequest() {
  if (!bookingForm.reportValidity()) return;

  const message = `Hello Cloud 7, I would like to send this request:\n\n${getRequestDetails()}`;
  const whatsappUrl = `https://wa.me/2348035269885?text=${encodeURIComponent(message)}`;
  window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  document.querySelector(".form-setup-note").textContent =
    "WhatsApp opened with your request. Press Send in WhatsApp to complete it.";
}

menuFilterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    menuFilterButtons.forEach((filter) => {
      const isActive = filter === button;
      filter.classList.toggle("is-active", isActive);
      filter.setAttribute("aria-pressed", String(isActive));
    });
    filterMenu(button.dataset.category);
  });
});

experienceFilterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    experienceFilterButtons.forEach((filter) => {
      const isActive = filter === button;
      filter.classList.toggle("is-active", isActive);
      filter.setAttribute("aria-pressed", String(isActive));
    });
    experienceCards.forEach((card) => {
      card.hidden = card.id !== button.getAttribute("aria-controls");
    });
  });
});

document.querySelectorAll("[data-experience-carousel]").forEach((carousel) => {
  const slides = Array.from(carousel.querySelectorAll(".experience-gallery figure"));
  const previous = carousel.querySelector(".experience-carousel-prev");
  const next = carousel.querySelector(".experience-carousel-next");
  const count = carousel.querySelector(".experience-carousel-count");
  let activeIndex = 0;

  function showExperienceSlide(index) {
    activeIndex = (index + slides.length) % slides.length;
    slides.forEach((slide, position) => {
      slide.hidden = position !== activeIndex;
    });
    count.textContent = `${activeIndex + 1} / ${slides.length}`;
  }

  previous.addEventListener("click", () => showExperienceSlide(activeIndex - 1));
  next.addEventListener("click", () => showExperienceSlide(activeIndex + 1));
  showExperienceSlide(activeIndex);
});

menuGrid.addEventListener("click", (event) => {
  const orderLink = event.target.closest("[data-order-item]");
  if (!orderLink) return;
  event.preventDefault();
  addToCart(orderLink.dataset.orderItem);
});

cartToggle.addEventListener("click", () => cartDialog.showModal());
cartCloseButton.addEventListener("click", () => cartDialog.close());
cartDialog.addEventListener("click", (event) => {
  if (event.target === cartDialog) cartDialog.close();
});
cartItemsContainer.addEventListener("click", (event) => {
  const control = event.target.closest("[data-cart-action]");
  if (!control) return;

  const { itemId, cartAction } = control.dataset;
  const quantity = cart.get(itemId) || 0;
  if (cartAction === "increase") {
    cart.set(itemId, quantity + 1);
  } else if (cartAction === "decrease") {
    if (quantity > 1) cart.set(itemId, quantity - 1);
    else cart.delete(itemId);
  } else if (cartAction === "remove") {
    cart.delete(itemId);
  }
  updateCart();
});
orderItemsList.addEventListener("change", updateManualOrderSummary);
orderItemsList.addEventListener("input", updateManualOrderSummary);
addOrderItemButton.addEventListener("click", addOrderItemRow);
orderMethodSelect.addEventListener("change", () => updateDeliveryLocationField());
emailFallbackButton.addEventListener("click", () => {
  openWhatsAppRequest();
});
bookingForm.addEventListener("submit", (event) => {
  event.preventDefault();
  openEmailDraft();
});
cartCancelButton.addEventListener("click", () => {
  cart.clear();
  cartCheckoutMode = false;
  orderItemSelect.value = "";
  orderQuantityInput.value = "1";
  requestTypeSelect.value = "Reservation";
  setRequestType("Reservation");
  updateCart();
  cartEmptyMessage.textContent = "Your order has been cancelled. Your cart is empty.";
});
cartCheckoutButton.addEventListener("click", () => {
  if (!cart.size) return;
  cartEmptyMessage.textContent = "Your cart is waiting for something good.";
  cartCheckoutMode = true;
  requestTypeSelect.value = "Order";
  setRequestType("Order");
  cartDialog.close();
  document.querySelector("#reserve").scrollIntoView({ behavior: "smooth", block: "start" });
});
requestTypeSelect.addEventListener("change", () => setRequestType(requestTypeSelect.value));

populateOrderItems();
updateCart();
updateManualOrderSummary();
setRequestType(requestTypeSelect.value);

const bookingDate = document.querySelector("#booking-date");
const localToday = new Date();
bookingDate.min = [
  localToday.getFullYear(),
  String(localToday.getMonth() + 1).padStart(2, "0"),
  String(localToday.getDate()).padStart(2, "0"),
].join("-");
