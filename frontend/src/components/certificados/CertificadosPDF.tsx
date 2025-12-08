
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import plantillaImg from '../../assets/CertificadoOHSANSI.png';

interface Participante {
  id: number;
  nombre: string;
  institucion: string;
  area: string;
  nivel: string;
  posicion: string;
  responsableArea: string;
}

interface CertificadosPDFProps {
  participantes: Participante[];
}

const styles = StyleSheet.create({
  page: {
    position: 'relative',
    width: '210mm',
    height: '297mm',
    margin: 0,
    padding: 0,
  },
  background: {
    position: 'absolute',
    width: '210mm',
    height: '297mm',
    top: 0,
    left: 0,
  },
  content: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    top: 0,
    left: 0,
  },
  seccionA: {
    position: 'absolute',
    top: '42%',
    left: '20%',
    fontSize: 13,
    color: '#000000',
    fontWeight: 'bold',
  },
  nombreEstudiante: {
    position: 'absolute',
    top: '45%',
    left: '25%',
    transform: 'translateX(-50%)',
    fontSize: 26,
    fontWeight: 'bold',
    color: '#3807faff',
    textAlign: 'center',
    width: '75%',
  },
  medalla: {
    position: 'absolute',
    top: '50%',
    left: '25%',
    transform: 'translateX(-50%)',
    fontSize: 18,
    fontWeight: 'bold',
    color: '#090000ff',
    textAlign: 'center',
    width: '75%',
  },
  unidadEducativa: {
    position: 'absolute',
    top: '54%',
    left: '25%',
    transform: 'translateX(-50%)',
    fontSize: 12,
    color: '#0b0b0bff',
    textAlign: 'center',
    width: '75%',
  },
  descripcion: {
    position: 'absolute',
    top: '58%',
    left: '16%',
    width: '75%',
    fontSize: 10,
    color: '#1f2937',
    textAlign: 'justify',
    lineHeight: 1.3,
  },
  lugarFecha: {
    position: 'absolute',
    top: '68%',
    left: '25%',
    fontSize: 10,
    color: '#000000',
  },
  responsableArea: {
    position: 'absolute',
    bottom: '20%',
    left: '40%',
    textAlign: 'center',
    width: '22%',
  },
  directorAcademico: {
    position: 'absolute',
    bottom: '12%',
    left: '17%',
    textAlign: 'center',
    width: '24%',
  },
  decano: {
    position: 'absolute',
    bottom: '12%',
    right: '10%',
    textAlign: 'center',
    width: '26%',
  },
  responsableNombre: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 2,
  },
  responsableCargo: {
    fontSize: 7,
    color: '#4b5563',
    lineHeight: 1.3,
  },
});

const obtenerFechaActual = (): string => {
  const fecha = new Date();
  const dia = fecha.getDate();
  const meses = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
  ];
  const mes = meses[fecha.getMonth()];
  const año = fecha.getFullYear();
  return `${dia} días del mes de ${mes} de ${año}`;
};

const CertificadosPDF = ({ participantes }: CertificadosPDFProps) => (
  <Document>
    {participantes.map((p) => {
      const descripcion = `En reconocimiento a su desempeño en la Olimpiada Científica Nacional San Simón-OhSanSi 2025; demostrando un nivel de excelencia y destacándose entre los participantes en el área de ${p.area} - ${p.nivel} Secundaria, durante el evento realizado el 11 de octubre, en la ciudad de Cochabamba.

Este logro refleja su esfuerzo, conocimiento y dedicación, lo que contribuye a su desarrollo académico y científico.`;

      return (
        <Page key={p.id} size="A4" orientation="portrait" style={styles.page}>
          <Image src={plantillaImg} style={styles.background} />
          <View style={styles.content}>
            <Text style={styles.seccionA}>A:</Text>
            <Text style={styles.nombreEstudiante}>
              {p.nombre.toUpperCase()}
            </Text>
            <Text style={styles.medalla}>
              {(p.posicion || '').toUpperCase()}
            </Text>
            <Text style={styles.unidadEducativa}>
              U. E. "{p.institucion.toUpperCase()}"
            </Text>
            <Text style={styles.descripcion}>
              {descripcion}
            </Text>
            <Text style={styles.lugarFecha}>
              Cochabamba, a los {obtenerFechaActual()}.
            </Text>
            <View style={styles.responsableArea}>
              <Text style={styles.responsableNombre}>
                {p.responsableArea}
              </Text>
              <Text style={styles.responsableCargo}>
                COMITE ACADÉMICO{'\n'}
                ÁREA DE {p.area.toUpperCase()}
              </Text>
            </View>
            <View style={styles.directorAcademico}>
              <Text style={styles.responsableNombre}>
                Msc. Ing. Javier Caballero Flores
              </Text>
              <Text style={styles.responsableCargo}>
                DIRECTOR ACADÉMICO
              </Text>
              <Text style={styles.responsableCargo}>
                FACULTAD DE CIENCIAS Y TECNOLOGIA
              </Text>
            </View>
            <View style={styles.decano}>
              <Text style={styles.responsableNombre}>
                Mgr. Ing. Marcelo Torrejón Rocabado
              </Text>
              <Text style={styles.responsableCargo}>
                DECANO
              </Text>
              <Text style={styles.responsableCargo}>
                FACULTAD DE CIENCIAS Y TECNOLOGIA
              </Text>
            </View>
          </View>
        </Page>
      );
    })}
  </Document>
);

export default CertificadosPDF;
