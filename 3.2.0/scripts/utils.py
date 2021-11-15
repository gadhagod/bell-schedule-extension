end = "\033[0m"

def to_green(message: str) -> str:
    return f"\033[92m{message}{end}"

def to_red(message: str) -> str:
    return f"\033[91m{message}{end}"