import { relations } from 'drizzle-orm';
import { pgTable, text, timestamp, boolean, index, integer, uniqueIndex } from 'drizzle-orm/pg-core';

export const user = pgTable('user', {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    email: text('email').notNull().unique(),
    emailVerified: boolean('email_verified').default(false).notNull(),
    image: text('image'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
        .defaultNow()
        .$onUpdate(() => /* @__PURE__ */ new Date())
        .notNull(),
    role: text('role').default('user'),
    printShopId: text('print_shop_id').references(() => printShop.id),
    banned: boolean('banned').default(false),
    banReason: text('ban_reason'),
    banExpires: timestamp('ban_expires'),
});

export const session = pgTable(
    'session',
    {
        id: text('id').primaryKey(),
        expiresAt: timestamp('expires_at').notNull(),
        token: text('token').notNull().unique(),
        createdAt: timestamp('created_at').defaultNow().notNull(),
        updatedAt: timestamp('updated_at')
            .$onUpdate(() => /* @__PURE__ */ new Date())
            .notNull(),
        ipAddress: text('ip_address'),
        userAgent: text('user_agent'),
        userId: text('user_id')
            .notNull()
            .references(() => user.id, { onDelete: 'cascade' }),
        impersonatedBy: text('impersonated_by'),
    },
    (table) => [index('session_userId_idx').on(table.userId)],
);

export const account = pgTable(
    'account',
    {
        id: text('id').primaryKey(),
        accountId: text('account_id').notNull(),
        providerId: text('provider_id').notNull(),
        userId: text('user_id')
            .notNull()
            .references(() => user.id, { onDelete: 'cascade' }),
        accessToken: text('access_token'),
        refreshToken: text('refresh_token'),
        idToken: text('id_token'),
        accessTokenExpiresAt: timestamp('access_token_expires_at'),
        refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
        scope: text('scope'),
        password: text('password'),
        createdAt: timestamp('created_at').defaultNow().notNull(),
        updatedAt: timestamp('updated_at')
            .$onUpdate(() => /* @__PURE__ */ new Date())
            .notNull(),
    },
    (table) => [index('account_userId_idx').on(table.userId)],
);

export const verification = pgTable(
    'verification',
    {
        id: text('id').primaryKey(),
        identifier: text('identifier').notNull(),
        value: text('value').notNull(),
        expiresAt: timestamp('expires_at').notNull(),
        createdAt: timestamp('created_at').defaultNow().notNull(),
        updatedAt: timestamp('updated_at')
            .defaultNow()
            .$onUpdate(() => /* @__PURE__ */ new Date())
            .notNull(),
    },
    (table) => [index('verification_identifier_idx').on(table.identifier)],
);

export const userRelations = relations(user, ({ one, many }) => ({
    sessions: many(session),
    accounts: many(account),
    printShop: one(printShop, {
        fields: [user.printShopId],
        references: [printShop.id],
    }),
}));

export const sessionRelations = relations(session, ({ one }) => ({
    user: one(user, {
        fields: [session.userId],
        references: [user.id],
    }),
}));

export const accountRelations = relations(account, ({ one }) => ({
    user: one(user, {
        fields: [account.userId],
        references: [user.id],
    }),
}));

export const product = pgTable('product', {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    description: text('description'),
    active: boolean('active').default(true).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
        .defaultNow()
        .$onUpdate(() => new Date())
        .notNull(),
});

export const productSize = pgTable(
    'product_size',
    {
        id: text('id').primaryKey(),
        productId: text('product_id')
            .notNull()
            .references(() => product.id, { onDelete: 'cascade' }),
        size: text('size').notNull(),
    },
    (table) => [index('product_size_productId_idx').on(table.productId)],
);

export const productSizeStock = pgTable(
    'product_size_stock',
    {
        id: text('id').primaryKey(),
        productSizeId: text('product_size_id')
            .notNull()
            .references(() => productSize.id, { onDelete: 'cascade' }),
        printShopId: text('print_shop_id')
            .notNull()
            .references(() => printShop.id, { onDelete: 'cascade' }),
        stock: integer('stock').default(0).notNull(),
    },
    (table) => [
        index('product_size_stock_productSizeId_idx').on(table.productSizeId),
        index('product_size_stock_printShopId_idx').on(table.printShopId),
        uniqueIndex('product_size_stock_size_shop_uidx').on(table.productSizeId, table.printShopId),
    ],
);

export const printShop = pgTable('print_shop', {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    email: text('email').notNull(),
    active: boolean('active').default(true).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
        .defaultNow()
        .$onUpdate(() => new Date())
        .notNull(),
});

export const order = pgTable(
    'order',
    {
        id: text('id').primaryKey(),
        userId: text('user_id')
            .notNull()
            .references(() => user.id),
        createdAt: timestamp('created_at').defaultNow().notNull(),
    },
    (table) => [index('order_userId_idx').on(table.userId)],
);

export const orderItem = pgTable(
    'order_item',
    {
        id: text('id').primaryKey(),
        orderId: text('order_id')
            .notNull()
            .references(() => order.id, { onDelete: 'cascade' }),
        productId: text('product_id')
            .notNull()
            .references(() => product.id),
        productSizeId: text('product_size_id')
            .notNull()
            .references(() => productSize.id),
        printShopId: text('print_shop_id')
            .notNull()
            .references(() => printShop.id),
        quantity: integer('quantity').notNull(),
    },
    (table) => [index('order_item_orderId_idx').on(table.orderId)],
);

export const orderFulfillment = pgTable(
    'order_fulfillment',
    {
        id: text('id').primaryKey(),
        orderId: text('order_id')
            .notNull()
            .references(() => order.id, { onDelete: 'cascade' }),
        printShopId: text('print_shop_id')
            .notNull()
            .references(() => printShop.id),
        status: text('status').default('pending').notNull(),
        resendEmailId: text('resend_email_id'),
        createdAt: timestamp('created_at').defaultNow().notNull(),
        updatedAt: timestamp('updated_at')
            .defaultNow()
            .$onUpdate(() => new Date())
            .notNull(),
    },
    (table) => [
        index('order_fulfillment_orderId_idx').on(table.orderId),
        uniqueIndex('order_fulfillment_order_print_shop_uidx').on(table.orderId, table.printShopId),
    ],
);

export const productRelations = relations(product, ({ many }) => ({
    sizes: many(productSize),
}));

export const productSizeRelations = relations(productSize, ({ one, many }) => ({
    product: one(product, {
        fields: [productSize.productId],
        references: [product.id],
    }),
    stocks: many(productSizeStock),
}));

export const productSizeStockRelations = relations(productSizeStock, ({ one }) => ({
    productSize: one(productSize, {
        fields: [productSizeStock.productSizeId],
        references: [productSize.id],
    }),
    printShop: one(printShop, {
        fields: [productSizeStock.printShopId],
        references: [printShop.id],
    }),
}));

export const printShopRelations = relations(printShop, ({ many }) => ({
    orderItems: many(orderItem),
    orderFulfillments: many(orderFulfillment),
    productSizeStocks: many(productSizeStock),
    users: many(user),
}));

export const orderRelations = relations(order, ({ one, many }) => ({
    user: one(user, {
        fields: [order.userId],
        references: [user.id],
    }),
    items: many(orderItem),
    fulfillments: many(orderFulfillment),
}));

export const orderFulfillmentRelations = relations(orderFulfillment, ({ one }) => ({
    order: one(order, {
        fields: [orderFulfillment.orderId],
        references: [order.id],
    }),
    printShop: one(printShop, {
        fields: [orderFulfillment.printShopId],
        references: [printShop.id],
    }),
}));

export const orderItemRelations = relations(orderItem, ({ one }) => ({
    order: one(order, {
        fields: [orderItem.orderId],
        references: [order.id],
    }),
    product: one(product, {
        fields: [orderItem.productId],
        references: [product.id],
    }),
    productSize: one(productSize, {
        fields: [orderItem.productSizeId],
        references: [productSize.id],
    }),
    printShop: one(printShop, {
        fields: [orderItem.printShopId],
        references: [printShop.id],
    }),
}));
