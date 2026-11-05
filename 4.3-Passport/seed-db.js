const { AppDataSource } = require("./data-source");
const { Cab } = require("./entity/Cab");

const cabs = [
  {
    id: 1,
    type: "Mini",
    name: "Maruti Suzuki Alto 800",
    customer_name: "Ravi Kumar",
    phone: "9876543210",
    pricePerKm: 10,
    status: 1,
    image: "https://images.unsplash.com/photo-1503736334956-4c8f8e92946d",
  },
  {
    id: 2,
    type: "Sedan",
    name: "Honda City",
    customer_name: "Amit Sharma",
    phone: "9876543211",
    pricePerKm: 12,
    status: 1,
    image: "https://images.unsplash.com/photo-1503736334956-4c8f8e92946d",
  },
  {
    id: 3,
    type: "SUV",
    name: "Hyundai Creta",
    customer_name: "Ravi",
    phone: "9876543212",
    pricePerKm: 15,
    status: 1,
    image: "https://images.unsplash.com/photo-1503736334956-4c8f8e92946d",
  },
  {
    id: 4,
    type: "Luxury",
    name: "Mercedes-Benz E-Class",
    customer_name: "Amit",
    phone: "9876543213",
    pricePerKm: 20,
    status: 1,
    image: "https://images.unsplash.com/photo-1503736334956-4c8f8e92946d",
  },
  {
    id: 5,
    type: "Electric",
    name: "Tata Nexon EV",
    customer_name: "Sharma",
    phone: "9876543214",
    pricePerKm: 8,
    status: 1,
    image: "https://images.unsplash.com/photo-1503736334956-4c8f8e92946d",
  },
  {
    id: 6,
    type: "Traveller",
    name: "Force Traveller",
    customer_name: "Kumar",
    phone: "9876543215",
    pricePerKm: 18,
    status: 1,
    image: "https://images.unsplash.com/photo-1503736334956-4c8f8e92946d",
  },
];

module.exports.seedDB = async () => {
  await AppDataSource.synchronize(true)
  const cabRepo = AppDataSource.getRepository(Cab);
  const result =  await cabRepo.save(cabs);
  console.log("Seeded Cabs:", result)
};