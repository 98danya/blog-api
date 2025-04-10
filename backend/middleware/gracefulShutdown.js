const gracefulShutdown = (prisma) => {
    process.on('SIGINT', async () => {
      console.log('Received SIGINT, shutting down server...');
      await prisma.$disconnect();
      process.exit(0);
    });
  
    process.on('SIGTERM', async () => {
      console.log('Received SIGTERM, shutting down server...');
      await prisma.$disconnect();
      process.exit(0);
    });
  };
  
  module.exports = gracefulShutdown;