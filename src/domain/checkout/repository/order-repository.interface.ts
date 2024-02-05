import RepositoryInterface from "../../@shared/repository/repository-interface";
import Order from "../entity/order";
import OrderItem from "../entity/order_item";

export default interface OrderRepositoryInterface extends RepositoryInterface<Order> 
{
    createOrderItem(entity: OrderItem, order: Order): Promise<void>;
}