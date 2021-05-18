# Linear regression for bike sharing data

# Import csv data
data = read.csv("/Users/chanheepark/develop/mlvis/data/bike.csv")
head(data, 5)

# generate regression model
model = lm(count ~ season + holiday + workingday + weather + temp + atemp + humidity + windspeed + casual + registered, data = data)
summary(model)
