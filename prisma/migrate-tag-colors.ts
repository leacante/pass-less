// Script para migrar los tags existentes y asignarles colores aleatorios
import { PrismaClient } from '@prisma/client';
import { TAG_COLORS } from '../src/lib/tagColors';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando migración de colores para tags...');

  // Obtener todos los tags
  const tags = await prisma.tag.findMany();

  console.log(`Encontrados ${tags.length} tags`);

  // Actualizar cada tag que tenga un color vacío o nulo
  let updated = 0;
  for (const tag of tags) {
    // Si el tag no tiene color válido, asignamos uno aleatorio
    if (!tag.color || tag.color === '') {
      const randomColor = TAG_COLORS[Math.floor(Math.random() * TAG_COLORS.length)];
      await prisma.tag.update({
        where: { id: tag.id },
        data: { color: randomColor },
      });
      console.log(`Tag "${tag.name}" actualizado con color ${randomColor}`);
      updated++;
    }
  }

  console.log(`Migración completada! ${updated} tags actualizados.`);
}

main()
  .catch((e) => {
    console.error('Error durante la migración:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
