# HW06 — API Testing

API testing assignment for the EShop SUT.

- Student ID: `23127414`
- Toolchain: Postman + Newman
- SUT: <https://github.com/ttbhanh/eshop-sut>
- Base URL: `http://localhost:3000`

## Selected scope

| Pool | Feature | Endpoint(s) |
| --- | --- | --- |
| A | FR-01 Account Registration | `POST /api/register` |
| B | FR-11 User Order History | `GET /api/orders/my-orders` |
| C | FR-14 Category CRUD | `GET /api/categories`, `POST /api/categories`, `PUT /api/categories/:id`, `DELETE /api/categories/:id` |

Every request must include `X-Student-Id: 23127414`. Each endpoint targets at least 35 AI-generated test cases plus at least 5 human-added cases.

The final test summary and self-assessment table will be added after execution evidence is complete.
