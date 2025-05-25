from locust import HttpUser, task, between

class PustakBazzarUser(HttpUser):
    wait_time = between(1, 5)  # Users wait between 1 and 5 seconds between actions

    @task(3)
    def browse_books(self):
        """Simulates browsing books"""
        self.client.post("/api/book/get")


    # @task(1)
    # def view_recommendations(self):
    #     """Simulates fetching recommendations"""
    #     self.client.get("/api/recommendations?user_id=123")

    # @task(2)
    # def make_payment(self):
    #     """Simulates making a payment"""
    #     payment_data = {
    #         "user_id": "123",
    #         "amount": 500,
    #         "method": "Khalti",  # Payment method (Khalti/Stripe)
    #         "book_id": "456"
    #     }
    #     self.client.post("/api/payment", json=payment_data)