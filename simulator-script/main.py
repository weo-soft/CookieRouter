from router import Router
import cookie_clicker.categories as cats

g = cats.hardcore()
r = Router()

game_over = r.route_GPL(g, lookahead=1)

final_time = game_over.completion_time()
print('Final time: ' + str(final_time / 60 / 60)) # Print in hours.
print(game_over.num_buildings)