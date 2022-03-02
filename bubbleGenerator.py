import random

class Bubble:
    def __init__(self, x:int, y:int, size:float, riseSpeed:int, swaySpeed:float, animationOffset:float):
        self.x = x
        self.y = y
        self.size = size
        self.riseSpeed = riseSpeed
        self.swaySpeed = swaySpeed
        self.animationOffset = animationOffset
    
    def __str__(self) -> str:
        return f"{{x:{self.x}, y:{self.y}, size:{self.size}, riseSpeed:{self.riseSpeed}, swaySpeed:{self.swaySpeed}, animationOffset:{self.animationOffset}}}"

def generateBubble() -> Bubble:
    x = random.randint(0, 100)
    y = random.randint(-100, -100)
    size = round(random.uniform(0.5, 3.0), 1)
    riseSpeed = random.randint(40, 60)
    swaySpeed = round(random.uniform(2.0, 4.0), 1)
    animationOffset = round(random.uniform(0.0, 100.0), 1)
    return Bubble(x, y, size, riseSpeed, swaySpeed, animationOffset)

number = int(input("Number of bubbles: "))
for i in range(number):
    print(str(generateBubble()) + "," * (int(i != number-1)))