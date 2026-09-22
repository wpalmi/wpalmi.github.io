const express = require("express");
const { Client } = require("pg");
const cors = require("cors");

const app = express();
const PORT = 3000;

// Configuración Middlewares
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Configuración de Conexión PostgreSQL
const client = new Client({
  user: "postgres",
  host: "localhost",
  database: "inventario",
  password: "123admin", // Cambia esto por tu contraseña de PostgreSQL
  port: 5432,
});

// Inicialización de Servidor y BD con Migración Segura
async function iniciarServidor() {
  try {
    await client.connect();
    console.log("Conexión exitosa a la Base de Datos PostgreSQL (inventario)");

    // Migración automática para asegurar la columna
    await client.query(`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name='actas' AND column_name='ingeniero_id'
        ) THEN 
          ALTER TABLE actas ADD COLUMN ingeniero_id INT; 
        END IF; 
      END $$;
    `);

    app.listen(PORT, () => {
      console.log(`Servidor en ejecución: http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Error al iniciar conexión a la base de datos:", err);
  }
}

// --- ENDPOINTS API ---

// Login
app.post("/api/login", async (req, res) => {
  try {
    const { usuario, password } = req.body;
    const result = await client.query(
      "SELECT * FROM usuarios_sistema WHERE usuario = $1 AND password = $2",
      [usuario, password],
    );

    if (result.rows.length > 0) {
      const u = result.rows[0];
      res.json({
        ok: true,
        usuario: { id: u.id, nombre: u.nombre, usuario: u.usuario, rol: u.rol },
      });
    } else {
      res.json({ ok: false, error: "Credenciales inválidas" });
    }
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Logs Auditoría
app.get("/api/logs", async (req, res) => {
  try {
    const result = await client.query(
      "SELECT * FROM logs_auditoria ORDER BY fecha DESC LIMIT 100",
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Parámetros
app.get("/api/parametros/:tipo", async (req, res) => {
  try {
    const { tipo } = req.params;
    const result = await client.query(
      "SELECT * FROM parametros_master WHERE tipo = $1 ORDER BY valor ASC",
      [tipo],
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/parametros/guardar", async (req, res) => {
  try {
    const { tipo, valor, usuario_registro } = req.body;
    await client.query(
      "INSERT INTO parametros_master (tipo, valor) VALUES ($1, $2)",
      [tipo, valor],
    );
    await client.query(
      "INSERT INTO logs_auditoria (usuario, accion, detalle) VALUES ($1, $2, $3)",
      [
        usuario_registro || "SISTEMA",
        "CREAR_PARAMETRO",
        `Parámetro agregado: ${tipo} - ${valor}`,
      ],
    );
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.delete("/api/parametros/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await client.query("DELETE FROM parametros_master WHERE id = $1", [id]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Colaboradores
app.get("/api/colaboradores", async (req, res) => {
  try {
    const result = await client.query(
      "SELECT * FROM colaboradores ORDER BY nombre_completo ASC",
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/colaboradores/:cedula", async (req, res) => {
  try {
    const { cedula } = req.params;
    const result = await client.query(
      "SELECT * FROM colaboradores WHERE cedula = $1",
      [cedula],
    );
    if (result.rows.length > 0) {
      res.json({ ok: true, colaborador: result.rows[0] });
    } else {
      res.json({ ok: false });
    }
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.post("/api/colaboradores/guardar", async (req, res) => {
  try {
    const { cedula, nombre_completo, gerencia, sede } = req.body;
    await client.query(
      `INSERT INTO colaboradores (cedula, nombre_completo, gerencia, sede) 
       VALUES ($1, $2, $3, $4) 
       ON CONFLICT (cedula) DO UPDATE 
       SET nombre_completo = $2, gerencia = $3, sede = $4`,
      [cedula, nombre_completo, gerencia, sede],
    );
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.delete("/api/colaboradores/:cedula", async (req, res) => {
  try {
    const { cedula } = req.params;
    await client.query("DELETE FROM colaboradores WHERE cedula = $1", [cedula]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Equipos
app.get("/api/equipos", async (req, res) => {
  try {
    const result = await client.query(
      "SELECT * FROM equipos ORDER BY placa_inventario ASC",
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/equipos/:placa", async (req, res) => {
  try {
    const { placa } = req.params;
    const result = await client.query(
      "SELECT * FROM equipos WHERE placa_inventario = $1",
      [placa],
    );
    if (result.rows.length > 0) {
      res.json({ ok: true, equipo: result.rows[0] });
    } else {
      res.json({ ok: false });
    }
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.post("/api/equipos/guardar", async (req, res) => {
  try {
    const {
      placa_inventario,
      tipo_equipo,
      marca,
      modelo,
      serial,
      hostname,
      estado,
      usuario_registro,
    } = req.body;
    await client.query(
      `INSERT INTO equipos (placa_inventario, tipo_equipo, marca, modelo, serial, hostname, estado) 
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        placa_inventario,
        tipo_equipo,
        marca,
        modelo,
        serial,
        hostname,
        estado || "Disponible",
      ],
    );
    await client.query(
      "INSERT INTO logs_auditoria (usuario, accion, detalle) VALUES ($1, $2, $3)",
      [
        usuario_registro || "SISTEMA",
        "CREAR_EQUIPO",
        `Equipo creado: ${placa_inventario}`,
      ],
    );
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.put("/api/equipos/:placa", async (req, res) => {
  try {
    const { placa } = req.params;
    const {
      tipo_equipo,
      marca,
      modelo,
      serial,
      hostname,
      estado,
      usuario_registro,
    } = req.body;
    await client.query(
      `UPDATE equipos SET tipo_equipo=$1, marca=$2, modelo=$3, serial=$4, hostname=$5, estado=$6 
       WHERE placa_inventario=$7`,
      [tipo_equipo, marca, modelo, serial, hostname, estado, placa],
    );
    await client.query(
      "INSERT INTO logs_auditoria (usuario, accion, detalle) VALUES ($1, $2, $3)",
      [
        usuario_registro || "SISTEMA",
        "EDITAR_EQUIPO",
        `Equipo modificado: ${placa}`,
      ],
    );
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.delete("/api/equipos/:placa", async (req, res) => {
  try {
    const { placa } = req.params;
    await client.query("DELETE FROM equipos WHERE placa_inventario = $1", [
      placa,
    ]);
    res.json({ ok: true, mensaje: "Equipo eliminado." });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.get("/api/equipos/historial/:placa", async (req, res) => {
  try {
    const { placa } = req.params;
    const result = await client.query(
      `SELECT h.*, c.nombre_completo as nombre_colaborador 
       FROM historial_movimientos h 
       LEFT JOIN colaboradores c ON h.cedula_colaborador = c.cedula 
       WHERE h.placa_inventario = $1 ORDER BY h.fecha_movimiento DESC`,
      [placa],
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Actas
app.post("/api/actas", async (req, res) => {
  try {
    const {
      tipo_acta,
      placa_inventario,
      cedula_colaborador,
      ingeniero_id,
      tipo_servicio,
      hostname,
      observaciones,
      firma_colaborador,
      firma_ingeniero,
      usuario_registro,
    } = req.body;

    const result = await client.query(
      `INSERT INTO actas 
       (tipo_acta, placa_inventario, cedula_colaborador, ingeniero_id, tipo_servicio, hostname, observaciones, firma_colaborador, firma_ingeniero, usuario_registro) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id_acta`,
      [
        tipo_acta,
        placa_inventario,
        cedula_colaborador,
        ingeniero_id,
        tipo_servicio,
        hostname,
        observaciones,
        firma_colaborador,
        firma_ingeniero,
        usuario_registro,
      ],
    );

    // Actualizar estado del equipo y usuario asignado
    const nuevoEstado = tipo_acta === "ASIGNACION" ? "Asignado" : "Disponible";
    const usuarioAsignado =
      tipo_acta === "ASIGNACION" ? cedula_colaborador : null;

    await client.query(
      "UPDATE equipos SET estado = $1, usuario_asignado = $2 WHERE placa_inventario = $3",
      [nuevoEstado, usuarioAsignado, placa_inventario],
    );

    // Guardar Trazabilidad
    await client.query(
      `INSERT INTO historial_movimientos 
       (placa_inventario, tipo_operacion, cedula_colaborador, usuario_registro, observaciones) 
       VALUES ($1, $2, $3, $4, $5)`,
      [
        placa_inventario,
        tipo_acta,
        cedula_colaborador,
        usuario_registro,
        observaciones,
      ],
    );

    res.json({ ok: true, id_acta: result.rows[0].id_acta });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.get("/api/actas/consulta", async (req, res) => {
  try {
    const result = await client.query(`
      SELECT a.*, e.tipo_equipo, e.marca, e.modelo, e.serial, 
             c.nombre_completo as nombre_colaborador, 
             u.nombre as nombre_ingeniero
      FROM actas a
      LEFT JOIN equipos e ON a.placa_inventario = e.placa_inventario
      LEFT JOIN colaboradores c ON a.cedula_colaborador = c.cedula
      LEFT JOIN usuarios_sistema u ON a.ingeniero_id = u.id
      ORDER BY a.fecha_creacion DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/actas/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await client.query(
      `
      SELECT a.*, e.tipo_equipo, e.marca, e.modelo, e.serial, 
             c.nombre_completo as nombre_colaborador, c.gerencia, c.sede,
             u.nombre as nombre_ingeniero
      FROM actas a
      LEFT JOIN equipos e ON a.placa_inventario = e.placa_inventario
      LEFT JOIN colaboradores c ON a.cedula_colaborador = c.cedula
      LEFT JOIN usuarios_sistema u ON a.ingeniero_id = u.id
      WHERE a.id_acta = $1
    `,
      [id],
    );

    if (result.rows.length > 0) {
      res.json({ ok: true, acta: result.rows[0] });
    } else {
      res.json({ ok: false });
    }
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.post("/api/actas/adjuntar-pdf", async (req, res) => {
  try {
    const { id_acta, documento_pdf } = req.body;
    await client.query(
      "UPDATE actas SET documento_pdf = $1 WHERE id_acta = $2",
      [documento_pdf, id_acta],
    );
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Usuarios del Sistema
app.get("/api/usuarios-sistema", async (req, res) => {
  try {
    const result = await client.query(
      "SELECT id, nombre, usuario, rol FROM usuarios_sistema ORDER BY nombre ASC",
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/usuarios-sistema/guardar", async (req, res) => {
  try {
    const { id, nombre, usuario, password, rol } = req.body;
    if (id) {
      if (password) {
        await client.query(
          "UPDATE usuarios_sistema SET nombre=$1, usuario=$2, password=$3, rol=$4 WHERE id=$5",
          [nombre, usuario, password, rol, id],
        );
      } else {
        await client.query(
          "UPDATE usuarios_sistema SET nombre=$1, usuario=$2, rol=$3 WHERE id=$4",
          [nombre, usuario, rol, id],
        );
      }
    } else {
      await client.query(
        "INSERT INTO usuarios_sistema (nombre, usuario, password, rol) VALUES ($1, $2, $3, $4)",
        [nombre, usuario, password || "123456", rol],
      );
    }
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.delete("/api/usuarios-sistema/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await client.query("DELETE FROM usuarios_sistema WHERE id = $1", [id]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Iniciar aplicación
iniciarServidor();
