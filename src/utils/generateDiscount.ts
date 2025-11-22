export function generateDiscountCode() {
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `BBG-${random}`;
}

export function convertTo12HourFormat(time24:any) {
  const [hours, minutes] = time24.split(":");
  let hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  hour = hour % 12;
  hour = hour ? hour : 12;
  return `${hour}:${minutes} ${ampm}`;
}
