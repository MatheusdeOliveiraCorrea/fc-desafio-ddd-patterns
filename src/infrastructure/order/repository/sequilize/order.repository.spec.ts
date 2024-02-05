import { Sequelize } from "sequelize-typescript";
import Order from "../../../../domain/checkout/entity/order";
import OrderItem from "../../../../domain/checkout/entity/order_item";
import Customer from "../../../../domain/customer/entity/customer";
import Address from "../../../../domain/customer/value-object/address";
import Product from "../../../../domain/product/entity/product";
import CustomerModel from "../../../customer/repository/sequelize/customer.model";
import CustomerRepository from "../../../customer/repository/sequelize/customer.repository";
import ProductModel from "../../../product/repository/sequelize/product.model";
import ProductRepository from "../../../product/repository/sequelize/product.repository";
import OrderItemModel from "./order-item.model";
import OrderModel from "./order.model";
import OrderRepository from "./order.repository";

describe("Order repository test", () => {
  let sequelize: Sequelize;

  beforeEach(async () => {
    sequelize = new Sequelize({
      dialect: "sqlite",
      storage: ":memory:",
      logging: false,
      sync: { force: true },
    });

    await sequelize.addModels([
      CustomerModel,
      OrderModel,
      OrderItemModel,
      ProductModel,
    ]);
    await sequelize.sync();
  });

  afterEach(async () => {
    await sequelize.close();
  });

  it("should create a new order", async () => {
    const customerRepository = new CustomerRepository();
    const customer = new Customer("123", "Customer 1");
    const address = new Address("Street 1", 1, "Zipcode 1", "City 1");
    customer.changeAddress(address);
    await customerRepository.create(customer);

    const productRepository = new ProductRepository();
    const product = new Product("123", "Product 1", 10);
    await productRepository.create(product);

    const orderItem = new OrderItem(
      "1",
      product.name,
      product.price,
      product.id,
      2
    );

    const order = new Order("123", "123", [orderItem]);

    const orderRepository = new OrderRepository();
    await orderRepository.create(order);

    const orderModel = await OrderModel.findOne({
      where: { id: order.id },
      include: ["items"],
    });

    expect(orderModel.toJSON()).toStrictEqual({
      id: "123",
      customer_id: "123",
      total: order.total(),
      items: [
        {
          id: orderItem.id,
          name: orderItem.name,
          price: orderItem.price,
          quantity: orderItem.quantity,
          order_id: "123",
          product_id: "123",
        },
      ],
    });
  });

  it("should find all orders",async () => {

    const customerRepository = new CustomerRepository();
    const customer = new Customer("C001", "Customer 1");
    const address = new Address("Street 1", 1, "Zipcode 1", "City 1");
    customer.changeAddress(address);

    const customer2 = new Customer("C002", "Customer 321");
    const address2 = new Address("Street 2", 1, "Zipcode 2", "City 2");
    customer2.changeAddress(address2);

    await customerRepository.create(customer);
    await customerRepository.create(customer2);

    const productRepository = new ProductRepository();
    const product = new Product("123", "Product 1", 10);
    await productRepository.create(product);

    const orderItem1 = new OrderItem(
      "1",
      product.name,
      product.price,
      product.id,
      2
    );

    const orderItem2 = new OrderItem(
      "2",
      product.name,
      product.price,
      product.id,
      2
    );

    const order1 = new Order("O1", customer.id, [orderItem1]);
    const order2 = new Order("O2", customer2.id, [orderItem2]);

    const orderRepository = new OrderRepository();
    await orderRepository.create(order1);
    await orderRepository.create(order2);

    const orders = [order1, order2];

    const FoundOrders = await orderRepository.findAll();

    expect(orders).toEqual(FoundOrders);  
  });

  it("should update an existing order", async () => {

    const customerRepository = new CustomerRepository();

    const customer = new Customer("C0001", "Customer 1");
    const address = new Address("Street 1", 1, "Zipcode 1", "City 1");
    customer.changeAddress(address);
    await customerRepository.create(customer);

    const customer2 = new Customer("C0002", "Customer 1");
    const address2 = new Address("Street 2", 1, "Zipcode 2", "City 2");
    customer2.changeAddress(address2);
    await customerRepository.create(customer2);

    const productRepository = new ProductRepository();
    
    const product = new Product("P0001", "Product 1", 10);
    await productRepository.create(product);

    const orderItem = new OrderItem(
      "1",
      product.name,
      product.price,
      product.id,
      2
    );

    const order = new Order("O0001", customer.id, [orderItem]);

    const orderRepository = new OrderRepository();
    await orderRepository.create(order);

    order.customerId = customer2.id; 

    const anotherOrderItem = new OrderItem("2", "Another Item", 324, product.id, 44);
    await orderRepository.createOrderItem(anotherOrderItem, order);

    order.items = [anotherOrderItem];

    await orderRepository.update(order);

    const orderAfterUpdate = await OrderModel.findOne(
      {
        where: { id: order.id },
        include: ["items"],
      });

    

    expect(orderAfterUpdate.toJSON()).toStrictEqual({
      id: order.id,
      customer_id: customer2.id,
      total: order.total(),
      items:
      [
        {
          id: anotherOrderItem.id,
          name: anotherOrderItem.name,
          order_id: order.id,
          price: anotherOrderItem.price,
          product_id: anotherOrderItem.productId,
          quantity: anotherOrderItem.quantity,
        }
      ]
    });
  });
});
