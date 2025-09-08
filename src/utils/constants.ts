export const DB_URL = `postgresql://${process.env.DB_USER!}:${process.env
    .DB_PASSWORD!}@localhost:${process.env.DB_PORT!}/${process.env.DB_NAME!}`;
