import { PrismaClient } from '../src/generated/prisma';
const prisma = new PrismaClient();

async function main() {
  const products = [
    {
      id: 1,
      name: 'Смартфон X200',
      description: '6.7" OLED, 128 ГБ, тройная камера, быстрая зарядка',
      price: 49990,
      image: '/smartphone.jpg',
    },
    {
      id: 2,
      name: 'Ноутбук Pro 15',
      description: 'Intel Core i7, 16 ГБ RAM, SSD 512 ГБ, RTX 3060',
      price: 89990,
      image: '/laptop.jpg',
    },
    {
      id: 3,
      name: 'Беспроводные наушники',
      description: 'Active Noise Cancelling, 30 ч работы, Bluetooth 5.2',
      price: 12990,
      image: '/headphones.jpg',
    },
    {
      id: 4,
      name: 'Умные часы',
      description: 'GPS, мониторинг здоровья, AMOLED-дисплей',
      price: 19990,
      image: '/smartwatch.jpg',
    },
    {
      id: 5,
      name: 'Планшет Tab S',
      description: '10.5" 120 Гц, стилус в комплекте, 128 ГБ',
      price: 35990,
      image: '/tablet.jpg',
    },
    {
      id: 6,
      name: 'Игровая консоль',
      description: '4K, 1 ТБ, беспроводной контроллер',
      price: 44990,
      image: '/console.jpg',
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { id: product.id },
      update: {},
      create: product,
    });
  }

  console.log('✅ Products seeded');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());