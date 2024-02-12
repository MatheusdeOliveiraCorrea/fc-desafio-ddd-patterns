import Order from "../../../../domain/checkout/entity/order";
import OrderItem from "../../../../domain/checkout/entity/order_item";
import OrderRepositoryInterface from "../../../../domain/checkout/repository/order-repository.interface";
import OrderItemModel from "./order-item.model";
import OrderModel from "./order.model";

export default class OrderRepository implements OrderRepositoryInterface {
  
  async createOrderItem(entity: OrderItem, order: Order): Promise<void> {
    await OrderItemModel.create({
      id: entity.id,
      product_id: entity.productId,
      order_id: order.id,
      quantity: entity.quantity,
      name: entity.name,
      price: entity.price
    });
  }
  
  async update(entity: Order): Promise<void> {
    
    const sequelize = OrderModel.sequelize;
    
    await sequelize.transaction(async (t) => {

      await OrderItemModel.destroy({
        where: { order_id: entity.id },
        transaction: t,
      });

      const items = entity.items.map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        product_id: item.productId,
        quantity: item.quantity,
        order_id: entity.id,
      }));

      await OrderItemModel.bulkCreate(items, { transaction: t });

      await OrderModel.update(
        { 
          total: entity.total(),
          customer_id: entity.customerId
        },
        { where: { id: entity.id }, transaction: t }
      );

    });
  }

  async find(id: string): Promise<Order> {

    const orderModel = await OrderModel.findOne({ where: { id } });

    const itens = orderModel.items
      .map((modelItem) =>
        new OrderItem(modelItem.id,
          modelItem.name,
          modelItem.price,
          modelItem.product_id,
          modelItem.quantity));

    return new Order(orderModel.id, orderModel.customer_id, itens);
  }

  async findAll(): Promise<Order[]> {

    const orderModels = await OrderModel.findAll({include: ["items"]});

    const orders = orderModels.map((orderModel) => {

      const itens = orderModel.items
      .map((modelItem) =>
        new OrderItem(modelItem.id,
          modelItem.name,
          modelItem.price,
          modelItem.product_id,
          modelItem.quantity));

      let order = new Order(orderModel.id, orderModel.customer_id, itens);

      return order;
    });

    return orders;
  }

  async create(entity: Order): Promise<void> {
    await OrderModel.create(
      {
        id: entity.id,
        customer_id: entity.customerId,
        total: entity.total(),
        items: entity.items.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          product_id: item.productId,
          quantity: item.quantity,
        })),
      },
      {
        include: [{ model: OrderItemModel }],
      }
    );
  }
}
