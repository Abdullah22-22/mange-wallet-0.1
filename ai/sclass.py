
class Readdata:
    def __init__(self, ticker, company_name, exchange, date, open_price, price, close):
        self.ticker = ticker
        self.company_name = company_name
        self.exchange = exchange
        self.date = date
        self.open_price = open_price
        self.price = price
        self.close = close


class Stock:
    def __init__(self, ticker, company_name, exchange, date, open_price, price, close, velocity, period="4wk"):
        self.ticker = ticker
        self.company_name = company_name
        self.exchange = exchange
        self.date = date
        self.open_price = open_price
        self.price = price
        self.close = close
        self.velocity = velocity
        self.period = period


class Prediction:
    def __init__(self, ticker, company_name, exchange, date, open_price, price, close, velocity, prediction):
        self.ticker = ticker
        self.company_name = company_name
        self.exchange = exchange
        self.date = date
        self.open_price = open_price
        self.price = price
        self.close = close
        self.velocity = velocity
        self.prediction = prediction





