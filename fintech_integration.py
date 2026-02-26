class InsuranceIntegration:
    def __init__(self):
        pass

    async def send_claim_report(self, data):
        return True

class ClaimEstimator:
    def __init__(self):
        pass

    def calculate_claim(self, insured_amount, damage_percent):
        return insured_amount * (damage_percent / 100.0)
