# Linear regression for bike sharing data

# Import csv data
data = read.csv("/Users/chanheepark/develop/mlvis/data/insurance/insurance.csv")
head(data, 5)

# generate regression model
model = lm(real ~ age + sex + bmi + children + smoker + north_east + north_west + south_east + south_west, data = data)
summary(model)
