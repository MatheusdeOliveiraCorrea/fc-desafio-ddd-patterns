import Customer from "../../entity/customer";
import Address from "../../value-object/address";

describe("Domain Events of customer", () => {

    it("should call handler 1 and handler 2 methods on customer creation", () => {

        const logSpy = jest.spyOn(console, 'log');

        const customer = new Customer("C0001", "matheus");
        
        expect(logSpy).toHaveBeenCalledWith('Esse é o primeiro console.log do evento: CustomerCreated');
        expect(logSpy).toHaveBeenCalledWith('Esse é o segundo console.log do evento: CustomerCreated');
    });

    it("should notify address handler on customer address change", () => {

        const customer = new Customer("C0001", "matheus");

        const customerAddress = new Address("rua tal", 999, "999-999", "goiânia");

        const logSpy = jest.spyOn(console, 'log');

        customer.changeAddress(customerAddress);

        expect(logSpy).toHaveBeenCalledWith('Esse é o primeiro console.log do evento: CustomerCreated');
        expect(logSpy).toHaveBeenCalledWith('Esse é o segundo console.log do evento: CustomerCreated');
        expect(logSpy).toHaveBeenCalledWith(`Endereço do cliente: ${customer.id}, ${customer.name} alterado para: ${customerAddress.toString()}`)
    })

})