import Order from "../../../../domain/checkout/entity/order";
import OrderItem from "../../../../domain/checkout/entity/order_item";
import OrderRepositoryInterface from "../../../../domain/checkout/repository/order-repository.interface";
import OrderItemModel from "./order-item.model";
import OrderModel from "./order.model";

export default class OrderRepository implements OrderRepositoryInterface {
  
  async update(entity: Order): Promise<void> {
    
    await OrderModel.update(
      {
        customer_id: entity.customerId,
        items: entity.items
      },
      {
        where: {
          id: entity.id,
        },
      }
    );
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
