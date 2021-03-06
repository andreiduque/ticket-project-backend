import { ticketMock } from "tests/mocks/ticket";
import { create } from "v1/api/ticket/create/create.service";
import { StatusCodeEnum } from "v1/enum/status-code";
import { TicketTypeEnum } from "v1/enum/ticket-type";
import { CustomError } from "v1/utils/error";

describe("create service", () => {
	const validCode = "aa0d8a";
	const validName = "generic";
	const validDescription = "bla bla bla";
	const validType = TicketTypeEnum.PERCENTAGE;
	const validDiscountValue = 50;
	const validExpirationDate = new Date();

	const findByCodeService = jest.fn();
	const duplicatedCodeError = new CustomError(
		"Ticket not found",
		StatusCodeEnum.NOT_FOUND,
	);

	describe("Successful", () => {
		it("should return a ticket", async () => {
			let result: any;

			const doc = ticketMock.doc({
				code: validCode,
				name: validName,
				description: validDescription,
				type: validType,
				discountValue: validDiscountValue,
				expirationDate: validExpirationDate,
			});

			findByCodeService.mockRejectedValue(duplicatedCodeError);
			ticketMock.repository.save.mockResolvedValue(doc);

			try {
				result = await create(
					{
						ticketRepository: ticketMock.repository,
						findByCodeService,
					},
					{
						code: validCode,
						name: validName,
						description: validDescription,
						type: validType,
						discountValue: validDiscountValue,
						expirationDate: validExpirationDate,
					},
				);
			} catch (err: any) {
				result = err;
			}

			expect(result).toStrictEqual(doc);
		});

		it("should return a ticket with an autogenerated code", async () => {
			let result: any;

			const doc = ticketMock.doc({
				code: validCode,
				name: validName,
				description: validDescription,
				type: validType,
				discountValue: validDiscountValue,
				expirationDate: validExpirationDate,
			});

			findByCodeService.mockRejectedValue(duplicatedCodeError);
			ticketMock.repository.save.mockResolvedValue(doc);

			try {
				result = await create(
					{
						ticketRepository: ticketMock.repository,
						findByCodeService,
					},
					{
						name: validName,
						description: validDescription,
						type: validType,
						discountValue: validDiscountValue,
						expirationDate: validExpirationDate,
					},
				);
			} catch (err: any) {
				result = err;
			}

			const expectedTicket = ticketMock.repository.save.mock.calls[0][0].code;

			expect(ticketMock.repository.save).toBeCalledWith({
				name: validName,
				description: validDescription,
				type: validType,
				discountValue: validDiscountValue,
				expirationDate: validExpirationDate,
				code: expectedTicket,
			});
			expect(typeof result.code).toBe("string");
		});
	});

	describe("Failure", () => {
		it("should throw a CustomError with a duplicated ticket code message", async () => {
			let result: any;

			const doc = ticketMock.doc({
				code: validCode,
				name: validName,
				description: validDescription,
				type: validType,
				discountValue: validDiscountValue,
				expirationDate: validExpirationDate,
			});

			findByCodeService.mockResolvedValue(doc);

			try {
				result = await create(
					{
						ticketRepository: ticketMock.repository,
						findByCodeService,
					},
					{
						name: validName,
						description: validDescription,
						type: validType,
						discountValue: validDiscountValue,
						expirationDate: validExpirationDate,
					},
				);
			} catch (err: any) {
				result = err;
			}

			expect(result instanceof CustomError).toBeTruthy();
			expect(result.message).toBe("Ticket with same code already exist");
			expect(result.statusCode).toBe(StatusCodeEnum.CONFLICT);
		});

		it("should throw a generic error", async () => {
			let result: any;

			findByCodeService.mockRejectedValue(new Error("Foo"));

			try {
				result = await create(
					{
						ticketRepository: ticketMock.repository,
						findByCodeService,
					},
					{
						name: validName,
						description: validDescription,
						type: validType,
						discountValue: validDiscountValue,
						expirationDate: validExpirationDate,
					},
				);
			} catch (err: any) {
				result = err;
			}

			expect(result instanceof Error).toBeTruthy();
			expect(result.message).toBe("Foo");
		});
	});
});
