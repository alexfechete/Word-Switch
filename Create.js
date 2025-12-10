/** Create section **/
const roomType = document.getElementById("privacy");
const passwordBox = document.getElementById("passwordWrapper");

roomType.addEventListener("change", () => {
  if (roomType.value === "private") {
    passwordBox.style.display = "block";
  } else {
    passwordBox.style.display = "none";
  }
});
