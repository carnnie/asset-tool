from logic.MARS import mars_insight

from django.test import TestCase
from mobile_invent.b_logic import take_back, give_away
import time


class TestGiveAway(TestCase):
    giveaway_to_set = {
        'item': None,
        'file': "",
        "user": "ilya.pashutin@metro-cc.ru", # mine Emain for test
        'operation_id': "test"
    }
    @classmethod
    def setUpClass(cls):
        pass

    def test_giveaway_base(self):
        pass


    def test_giveaway_jira(self):
        pass

    def test_giveaway_insigth_ereq(self):
        pass

    def test_giweaway_insight_hw(self):
        pass


class TestTakeBack(TestCase):
    giveaway_to_set = {
        "item": mars_insight.search(iql="", item_type="Hardware", results=1)[0],
        "file": "",
        "user": "ilya.pashutin@metro-cc.ru",  # mine Email for test
        "operation_id": "test",
    }

    def test_takeback_succ(self):
        give_away(**self.giveaway_to_set)
        time.sleep(5)
        hw = mars_insight.search(iql="", item_type="Hardware", results=1)[0]
        ereq = mars_insight.search(iql="", item_type="E-Requests", results=1)[0]
        jira = ''
        self.assertTrue(hw["Status"] == 1)
        self.assertTrue(hw["Location"] == 1)
        self.assertTrue(hw["HWUserUpdate"] == 1)

        self.assertTrue(ereq["Status"] == 1)
        self.assertTrue(ereq["Кто принял"] == 1)
