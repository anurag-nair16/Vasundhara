def get_response_time(priority: str) -> str:
    """
    Maps priority to a recommended response time.
    """
    priority = priority.lower()

    if priority == "high":
        return "Task must be addressed within 1 day"
    if priority == "medium":
        return "Task must be addressed within 3 days"
    return "Task must be addressed within 7 days"
