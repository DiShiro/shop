import prisma from '../db';
import { Product, Prisma } from '../generated/prisma';

export async function getAllProducts() {
  return prisma.product.findMany();
}

export async function getProductById(id: number) {
  return prisma.product.findUnique({
    where: { id },
  });
}

export async function createProduct(data: Prisma.ProductCreateInput){
    return prisma.product.create({
    data,
  });
}

export async function updateProduct(id: number, data: Prisma.ProductUpdateInput) {
  return prisma.product.update({
    where: { id },
    data,
  });
}

export async function deleteProduct(id: number) {
  return prisma.product.delete({
    where: { id },
  });
}