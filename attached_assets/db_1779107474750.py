import duckdb

_connection = None

def get_connection():
    global _connection

    if _connection is None:
        _connection = duckdb.connect(database=":memory:")

        _connection.execute("INSTALL spatial; LOAD spatial;")
        _connection.execute("INSTALL httpfs; LOAD httpfs;")

    return _connection