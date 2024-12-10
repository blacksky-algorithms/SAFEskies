-- CreateTable
CREATE TABLE "auth_states" (
    "key" TEXT NOT NULL PRIMARY KEY,
    "state" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "auth_sessions" (
    "key" TEXT NOT NULL PRIMARY KEY,
    "session" TEXT NOT NULL
);

